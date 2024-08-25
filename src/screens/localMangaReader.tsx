import { Box, Center, Flex, Heading, Icon, Image, Text, Tooltip } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { BsSortNumericDown, BsSortNumericUp } from 'react-icons/bs';
import { GoScreenFull, GoScreenNormal } from 'react-icons/go';
import { RiZoomInLine, RiZoomOutLine } from 'react-icons/ri';
import {
    TbLayoutSidebarLeftCollapseFilled,
    TbLayoutSidebarRightCollapseFilled,
} from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { localImagesPath } from 'src/constants/images';

import { ChapterImg, ChaptersSkeletons } from './mangaReaderScreen';
import { useFullScreenMode } from '../hooks/useFullScreenMode';
import { TDownload } from '../hooks/useGetDownloads';
import { useZoomHandler } from '../hooks/useZoomHandler';

type TMangaChapter = TDownload['chapters'][0];

function useGetMangaDetails() {
    const [searchParams] = useSearchParams();

    const params = useMemo(() => {
        const q = searchParams.get('q');

        return JSON.parse(q) as TDownload;
    }, [searchParams]);

    return {
        data: {
            params,
        },
    };
}

function useChapterListHandler({ chapters }: { chapters: TDownload['chapters'] }) {
    const [searchParams] = useSearchParams();
    const chapter_id = searchParams.get('chapter_id') || '';

    const [currentChapter, setCurrentChapter] = useState<TMangaChapter | null>(null);

    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const chps = useMemo(() => {
        switch (order) {
            case 'asc':
                return [...chapters].reverse();
            default:
                return chapters;
        }
    }, [chapters, order]);

    useEffect(() => {
        if (currentChapter?.file_location) return;

        if (chapter_id) {
            const chapterIndex = chps.findIndex((i) => i.id === Number(chapter_id));

            if (chapterIndex >= 0) {
                setCurrentChapter(chps[chapterIndex]);
                return;
            }
        }

        if (chps.length) setCurrentChapter(chps[0]);
    }, [chps]);

    return {
        chapters: chps,
        currentChapter,
        setCurrentChapter,
        toggleOrder: () => setOrder(order === 'asc' ? 'desc' : 'asc'),
        order,
    };
}

export function LocalMangaReaderScreen() {
    const {
        data: { params },
    } = useGetMangaDetails();

    const { chapters, currentChapter, setCurrentChapter, order, toggleOrder } =
        useChapterListHandler({
            chapters: params?.chapters ?? [],
        });

    const { isFullScreen, fullScreenRef, handleFullScreen } = useFullScreenMode();

    const [showChapters, setShowChapters] = useState(true);

    const { scale, zoomIn, zoomOut, isZoomInDisabled, isZoomOutDisabled } = useZoomHandler();

    return (
        <div
            style={{
                overflowY: 'hidden',
                maxHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}>
            <Center pt={6} w="100%">
                <Flex
                    flexDirection={'column'}
                    justifyContent="center"
                    alignItems={'center'}
                    w="95%"
                    margin={'0 auto'}>
                    <Box w="100%" h="100%">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GoBackBtn />
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}>
                                <Heading fontSize={'2xl'} fontFamily={'body'}>
                                    {params?.title}
                                </Heading>
                                <Text fontWeight={600} color={'gray.500'} size="sm" ml={2} mt={1}>
                                    | {currentChapter?.file_name || 'Manga Reader'}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Flex>
            </Center>

            <div
                ref={fullScreenRef}
                style={{
                    paddingBottom: 18,
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    overflowY: 'hidden',
                    rowGap: 5,
                    margin: '0 20px',
                }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <div
                        style={{
                            width: '20%',
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                        <Tooltip
                            label={showChapters ? 'Collapse Chapters' : 'Expand Chapters'}
                            placement="top">
                            <div
                                onClick={() => setShowChapters(!showChapters)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 10,
                                    columnGap: 10,
                                }}>
                                <Icon
                                    as={
                                        showChapters
                                            ? TbLayoutSidebarLeftCollapseFilled
                                            : TbLayoutSidebarRightCollapseFilled
                                    }
                                    w={6}
                                    h={6}
                                />
                                <Text fontSize="large" fontWeight={500}>
                                    Chapters
                                </Text>
                            </div>
                        </Tooltip>
                        {showChapters ? (
                            <Tooltip
                                label={order === 'asc' ? 'Sort in descending' : 'Sort in ascending'}
                                placement="top">
                                <div
                                    onClick={toggleOrder}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 10,
                                        columnGap: 10,
                                    }}>
                                    <Icon
                                        as={order === 'asc' ? BsSortNumericDown : BsSortNumericUp}
                                        w={6}
                                        h={6}
                                    />
                                </div>
                            </Tooltip>
                        ) : null}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            columnGap: 30,

                            alignItems: 'center',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                columnGap: 10,
                            }}>
                            <Box
                                opacity={isZoomOutDisabled ? 0.5 : 1}
                                cursor={isZoomOutDisabled ? 'not-allowed' : 'pointer'}
                                onClick={zoomOut}>
                                <Icon as={RiZoomOutLine} w={6} h={6} />
                            </Box>

                            <Text pointerEvents={'none'} userSelect={'none'}>
                                {scale * 10} %
                            </Text>

                            <Box
                                opacity={isZoomInDisabled ? 0.5 : 1}
                                cursor={isZoomInDisabled ? 'not-allowed' : 'pointer'}
                                onClick={zoomIn}>
                                <Icon as={RiZoomInLine} w={6} h={6} />
                            </Box>
                        </div>
                        <Tooltip
                            label={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                            placement="top">
                            <Box cursor={'pointer'} onClick={handleFullScreen}>
                                <Icon
                                    as={isFullScreen ? GoScreenNormal : GoScreenFull}
                                    w={6}
                                    h={6}
                                />
                            </Box>
                        </Tooltip>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexGrow: 1,
                        overflowY: 'hidden',
                        columnGap: 20,
                    }}>
                    <Flex
                        direction={'column'}
                        p={2}
                        rowGap={2}
                        overflowX={'hidden'}
                        className="custom-scrollbar"
                        sx={{
                            width: showChapters ? '25%' : 0,
                            display: 'flex',
                            flexGrow: 1,
                            overflowY: 'auto',
                            transition: 'width 0.3s ease-in-out',
                            visibility: showChapters ? 'visible' : 'hidden',
                        }}>
                        {chapters?.length ? (
                            chapters?.map?.((item) => (
                                <ChapterTabItem
                                    key={item.id}
                                    chp_detail={item}
                                    currentChapter={currentChapter}
                                    setCurrentChapter={setCurrentChapter}
                                />
                            ))
                        ) : (
                            <ChaptersSkeletons />
                        )}
                    </Flex>
                    <Box
                        className="custom-scrollbar"
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexGrow: 1,
                            overflowY: 'auto',
                        }}>
                        <MangaChapterImages currentChapter={currentChapter} imgScale={scale} />
                    </Box>
                </div>
            </div>
        </div>
    );
}

function ChapterTabItem({
    chp_detail,

    setCurrentChapter,
    currentChapter,
}: {
    chp_detail: TMangaChapter;
    currentChapter: TMangaChapter;
    setCurrentChapter: React.Dispatch<React.SetStateAction<TMangaChapter>>;
}) {
    const isSelected = chp_detail?.id === currentChapter?.id;

    return (
        <Flex
            cursor={'pointer'}
            justifyContent={'space-between'}
            columnGap={2}
            p={2}
            title={chp_detail.file_name}
            borderRadius={10}
            alignItems="center"
            bg={isSelected ? '#CBD5E0' : undefined}
            onClick={() => setCurrentChapter(chp_detail)}>
            <Text
                style={{
                    userSelect: 'none',
                    msUserSelect: 'none',
                    MozUserSelect: 'none',
                    WebkitUserSelect: 'none',
                    msTouchSelect: 'none',
                    pointerEvents: 'none',
                    borderRadius: 20,
                    objectFit: 'contain',
                }}
                noOfLines={1}
                color={isSelected ? '#1A202C' : '#CBD5E0'}>
                {chp_detail.file_name}
            </Text>
        </Flex>
    );
}

function MangaChapterImages({
    currentChapter,
    imgScale,
}: {
    currentChapter: TMangaChapter;
    imgScale: number;
}) {
    const chapters = currentChapter?.file_location;

    if (Array.isArray(chapters)) {
        return (
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    rowGap: 20,
                }}>
                {chapters?.map((item) => (
                    <div
                        style={{
                            width: `${imgScale * 10}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'width 0.5s ease-in-out',
                        }}>
                        <ChapterImg key={item} src={`file:///${item}`} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            style={{
                width: '100%',
                rowGap: 30,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <Image src={localImagesPath.loaderSearchGif} alt="loader" boxSize="250px" />
            <span
                style={{
                    fontWeight: 'bold',
                }}>
                Loading ...
            </span>
        </div>
    );
}
