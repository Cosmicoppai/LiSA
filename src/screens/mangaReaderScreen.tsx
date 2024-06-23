import { Box, Center, Flex, Heading, Image, Skeleton, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { localImagesPath } from 'src/constants/images';
import server from 'src/utils/axios';

import { TMangaChapters, getMangaDetails } from './getMangaDetails';

export function MangaReaderScreen() {
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
                                    | Manga Reader
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Flex>
            </Center>
            <MangaReader chapters={details?.chapters ?? []} isLoading={isLoading} />
        </div>
    );
}

function MangaReader({ chapters, isLoading }: { chapters: TMangaChapters; isLoading: boolean }) {
    const [currentChapter, setCurrentChapter] = useState({
        idx: 0,
        chp_link: null,
    });

    useEffect(() => {
        if (currentChapter.chp_link) return;

        if (chapters.length) {
            setCurrentChapter({
                idx: 0,
                chp_link: Object.entries(chapters[0])[0][1].chp_link,
            });
        }
    }, [chapters]);

    return (
        <div
            style={{
                display: 'flex',
                flexGrow: 1,
                overflowY: 'hidden',
                columnGap: 20,
                margin: '0 20px',
            }}>
            <div
                style={{
                    width: '20%',
                    height: '100%',
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                }}>
                <Text p={2} fontSize="large" fontWeight={'bold'} position={'sticky'}>
                    Chapters
                </Text>

                <Flex
                    direction={'column'}
                    p={2}
                    rowGap={3}
                    overflowY={'auto'}
                    overflowX={'hidden'}
                    sx={{
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
            </div>
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
    );
}

function MangaChapters({
    data,
    currentChapter,
    setCurrentChapter,
}: {
    isLoading: boolean;
    data: TMangaChapters;
    currentChapter: {
        idx: number;
        chp_link: any;
    };
    setCurrentChapter: React.Dispatch<
        React.SetStateAction<{
            idx: number;
            chp_link: any;
        }>
    >;
}) {
    return (
        <>
            {data?.length ? (
                <>
                    {data?.map((item, idx) => (
                        <>
                            {Object.entries(item).map(([chp_no, chap_detail]) => (
                                <Flex
                                    key={chp_no}
                                    cursor={'pointer'}
                                    p={2}
                                    title={` ${chp_no} ${
                                        chap_detail?.chp_name ? ` : ${chap_detail?.chp_name}` : null
                                    }`}
                                    borderRadius={10}
                                    alignItems="center"
                                    bg={idx === currentChapter.idx ? '#CBD5E0' : undefined}
                                    onClick={() =>
                                        setCurrentChapter({
                                            idx,
                                            chp_link: chap_detail.chp_link,
                                        })
                                    }>
                                    <Text
                                        noOfLines={1}
                                        color={idx === currentChapter.idx ? '#1A202C' : '#CBD5E0'}>
                                        {chp_no}
                                        {chap_detail?.chp_name
                                            ? ` : ${chap_detail?.chp_name}`
                                            : null}
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

function MangaChapterImages({
    currentChapter,
}: {
    currentChapter: {
        idx: number;
        chp_link: any;
    };
}) {
    const { data, isLoading } = useQuery({
        queryKey: ['manga-chp-images', currentChapter.chp_link],
        queryFn: () => getMangaChapter({ url: currentChapter.chp_link }),
    });

    const chapters = data?.data;

    if (isLoading) {
        return (
            <div
                style={{
                    width: '100%',
                    rowGap: 20,
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
                        borderRadius: 20,
                        objectFit: 'contain',
                    }}
                />
            ))}
        </div>
    );
}
