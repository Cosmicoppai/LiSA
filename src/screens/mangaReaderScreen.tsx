import { Box, Center, Flex, Heading, Icon, Image, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
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
import server from 'src/utils/axios';

import { TMangaChapter, TMangaChapters, getMangaDetails } from './getMangaDetails';
import { useZoomHandler } from './useZoomHandler';
import { useFullScreenMode } from '../hooks/useFullScreenMode';

function useGetMangaDetails() {
    const [searchParams] = useSearchParams();

    const query = useMemo(() => {
        const q = searchParams.get('q');

        return JSON.parse(q) as {
            manga_detail: string;
            poster: string;
            rank: string;
            title: string;
            type: string;
            volumes: string;
            score: string;
        };
    }, [searchParams]);

    const { data: d1, isLoading } = useQuery({
        queryKey: ['manga-details', query?.manga_detail],
        queryFn: () => getMangaDetails({ url: query?.manga_detail }),
    });

    const data = {
        ...d1?.data,
        ...query,
    };

    const details = d1?.details;

    return { data, details, isLoading };
}

function useChapterListHandler({ chapters }: { chapters: TMangaChapters }) {
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
        if (currentChapter?.chp_link) return;

        if (chps.length) setCurrentChapter(Object.entries(chps[0])[0][1]);
    }, [chps]);

    return {
        chapters: chps,
        currentChapter,
        setCurrentChapter,
        toggleOrder: () => setOrder(order === 'asc' ? 'desc' : 'asc'),
        order,
    };
}

export function MangaReaderScreen() {
    const { data, details } = useGetMangaDetails();

    const { chapters, currentChapter, setCurrentChapter, order, toggleOrder } =
        useChapterListHandler({
            chapters: details?.chapters ?? [],
        });

    const { isFullScreen, fullScreenRef, handleFullScreen } = useFullScreenMode();

    const [showChapters, setShowChapters] = useState(true);

    const { scale, zoomIn, zoomOut, isZoomInDisabled, isZoomOutDisabled } = useZoomHandler();

    return (
        <div
            style={{
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
                                    {data?.title}
                                </Heading>
                                <Text fontWeight={600} color={'gray.500'} size="sm" ml={2} mt={1}>
                                    | {currentChapter?.chp_name || 'Manga Reader'}
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
                        overflowY={'auto'}
                        overflowX={'hidden'}
                        sx={{
                            height: '100%',
                            width: showChapters ? '25%' : 0,
                            visibility: showChapters ? 'visible' : 'hidden',
                            transition: 'width 0.5s ease-in-out',
                            display: 'flex',
                            flexGrow: 1,

                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                                borderRadius: '8px',
                                backgroundColor: `rgba(255, 255, 255, 0.2)`,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: `rgba(255, 255, 255, 0.2)`,
                            },
                        }}>
                        {chapters?.length ? (
                            chapters?.map?.((item) => (
                                <>
                                    {Object.entries(item).map(([chp_no, chp_detail]) => (
                                        <ChapterTabItem
                                            key={chp_detail.chp_link}
                                            chp_detail={chp_detail}
                                            chp_no={chp_no}
                                            currentChapter={currentChapter}
                                            setCurrentChapter={setCurrentChapter}
                                        />
                                    ))}
                                </>
                            ))
                        ) : (
                            <ChaptersSkeletons />
                        )}
                    </Flex>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexGrow: 1,

                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                                borderRadius: '8px',
                                backgroundColor: `rgba(255, 255, 255, 0.2)`,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: `rgba(255, 255, 255, 0.2)`,
                            },
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
    chp_no,
    setCurrentChapter,
    currentChapter,
}: {
    chp_no: string;

    chp_detail: TMangaChapter;
    currentChapter: TMangaChapter;
    setCurrentChapter: React.Dispatch<React.SetStateAction<TMangaChapter>>;
}) {
    const isSelected = chp_detail?.chp_link === currentChapter?.chp_link;

    return (
        <Flex
            key={chp_no}
            cursor={'pointer'}
            p={2}
            title={` ${chp_no} ${chp_detail?.chp_name ? ` : ${chp_detail?.chp_name}` : null}`}
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
                {chp_no}
                {chp_detail?.chp_name ? ` : ${chp_detail?.chp_name}` : null}
            </Text>
        </Flex>
    );
}

function ChaptersSkeletons() {
    return (
        <Flex
            direction={'column'}
            rowGap={4}
            flexWrap="wrap"
            width={'100%'}
            justifyContent="center">
            {Array(18)
                .fill(0)
                .map((_, index) => (
                    <Skeleton key={index} p={2} width={'90%'} borderRadius={6} height={'30px'} />
                ))}
        </Flex>
    );
}

export async function getMangaChapter({ url }) {
    if (!url) return { data: [] };

    const { data } = await server.get(url);

    return {
        data: data ?? [],
    } as {
        data: string[];
    };
}

function MangaChapterImages({
    currentChapter,
    imgScale,
}: {
    currentChapter: TMangaChapter;
    imgScale: number;
}) {
    const chp_link = currentChapter?.chp_link;

    const { data, isLoading } = useQuery({
        queryKey: ['manga-chp-images', chp_link],
        queryFn: () => getMangaChapter({ url: chp_link }),
        enabled: Boolean(chp_link),
    });

    const chapters = data?.data;

    if (isLoading || !chapters?.length) {
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
                    <ChapterImg key={item} src={item} />
                </div>
            ))}
        </div>
    );
}

function ChapterImg({ src }: { src: string }) {
    // TODO: Add Skeleton Loader Here
    return (
        <img
            src={src}
            alt="manga-chapter-image"
            width={'100%'}
            style={{
                userSelect: 'none',
                msUserSelect: 'none',
                MozUserSelect: 'none',
                WebkitUserSelect: 'none',
                msTouchSelect: 'none',
                pointerEvents: 'none',
                borderRadius: 20,
                minHeight: 200,
                display: 'block',
            }}
            loading="lazy"
        />
    );
}
