import { Box, Center, Flex, Heading, Icon, Image, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { BsSortNumericDown, BsSortNumericUp } from 'react-icons/bs';
import { GoScreenFull, GoScreenNormal } from 'react-icons/go';
import {
    TbLayoutSidebarLeftCollapseFilled,
    TbLayoutSidebarRightCollapseFilled,
} from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { localImagesPath } from 'src/constants/images';
import server from 'src/utils/axios';

import { TMangaChapter, TMangaChapters, getMangaDetails } from './getMangaDetails';
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

type TCurrentChapter = {
    idx: number;
    chp: null | TMangaChapter;
};

function useChapterListHandler({ chapters }: { chapters: TMangaChapters }) {
    const [currentChapter, setCurrentChapter] = useState<TCurrentChapter>({
        idx: 0,
        chp: null,
    });

    useEffect(() => {
        if (currentChapter.chp?.chp_link) return;

        if (chapters.length) {
            setCurrentChapter({
                idx: 0,
                chp: Object.entries(chapters[0])[0][1],
            });
        }
    }, [chapters]);

    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const chps = useMemo(() => {
        switch (order) {
            case 'asc':
                return [...chapters].reverse();
            default:
                return chapters;
        }
    }, [chapters, order]);

    return {
        chapters: chps,
        currentChapter,
        setCurrentChapter,
        toggleOrder: () => setOrder(order === 'asc' ? 'desc' : 'asc'),
        order,
    };
}

export function MangaReaderScreen() {
    const { data, details, isLoading } = useGetMangaDetails();

    const { chapters, currentChapter, setCurrentChapter, order, toggleOrder } =
        useChapterListHandler({
            chapters: details?.chapters ?? [],
        });

    const { isFullScreen, fullScreenRef, handleFullScreen } = useFullScreenMode();

    const [showChapters, setShowChapters] = useState(true);

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
                                    | {currentChapter.chp?.chp_name || 'Manga Reader'}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Flex>
            </Center>

            <div
                ref={fullScreenRef}
                style={{
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
                    <Tooltip
                        label={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                        placement="top">
                        <Box
                            style={{
                                cursor: 'pointer',
                            }}
                            onClick={handleFullScreen}>
                            <Icon as={isFullScreen ? GoScreenNormal : GoScreenFull} w={8} h={8} />
                        </Box>
                    </Tooltip>
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
                        <MangaChapters
                            isLoading={isLoading}
                            data={chapters}
                            currentChapter={currentChapter}
                            setCurrentChapter={setCurrentChapter}
                        />
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
                        <MangaChapterImages currentChapter={currentChapter} />
                    </Box>
                </div>
            </div>
        </div>
    );
}

function MangaChapters({
    data,
    currentChapter,
    setCurrentChapter,
}: {
    isLoading: boolean;
    data: TMangaChapters;
    currentChapter: TCurrentChapter;
    setCurrentChapter: React.Dispatch<React.SetStateAction<TCurrentChapter>>;
}) {
    return (
        <>
            {data?.length ? (
                <>
                    {data?.map((item, idx) => (
                        <>
                            {Object.entries(item).map(([chp_no, chp_detail]) => (
                                <Flex
                                    key={chp_no}
                                    cursor={'pointer'}
                                    p={2}
                                    title={` ${chp_no} ${
                                        chp_detail?.chp_name ? ` : ${chp_detail?.chp_name}` : null
                                    }`}
                                    borderRadius={10}
                                    alignItems="center"
                                    bg={idx === currentChapter.idx ? '#CBD5E0' : undefined}
                                    onClick={() =>
                                        setCurrentChapter({
                                            idx,
                                            chp: chp_detail,
                                        })
                                    }>
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
                                        color={idx === currentChapter.idx ? '#1A202C' : '#CBD5E0'}>
                                        {chp_no}
                                        {chp_detail?.chp_name ? ` : ${chp_detail?.chp_name}` : null}
                                    </Text>
                                </Flex>
                            ))}
                        </>
                    ))}
                </>
            ) : (
                <ChaptersSkeletons />
            )}
        </>
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

function MangaChapterImages({ currentChapter }: { currentChapter: TCurrentChapter }) {
    const chp_link = currentChapter.chp?.chp_link;

    const { data, isLoading } = useQuery({
        queryKey: ['manga-chp-images', chp_link],
        queryFn: () => getMangaChapter({ url: chp_link }),
        enabled: Boolean(chp_link),
    });

    const chapters = data?.data;

    if (isLoading && chapters?.length > 1) {
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
            {chapters?.map((item, idx) => (
                <img
                    key={idx}
                    src={item}
                    alt={`manga-chapter-${idx}-image`}
                    width={'65%'}
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
                />
            ))}
        </div>
    );
}
