import { Box, Center, Flex, Heading, Image, Skeleton, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// @ts-ignore
import LoaderSearchGif from 'src/assets/img/loader-serch.gif';
import { GoBackBtn } from 'src/components/GoBackBtn';
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
            <MangaChapters
                isLoading={isLoading}
                data={chapters}
                currentChapter={currentChapter}
                setCurrentChapter={setCurrentChapter}
            />
            <Box
                // backgroundColor={'gray.800'}
                style={{
                    width: '100%',
                    display: 'flex',
                    flexGrow: 1,
                    padding: 8,
                    borderRadius: 16,
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
                <Flex direction={'column'} p={2} rowGap={3} overflowY={'auto'} overflowX={'hidden'}>
                    {data?.map((item, idx) => (
                        <>
                            {Object.entries(item).map(([chp_no, chap_detail]) => (
                                <Flex
                                    key={chp_no}
                                    cursor={'pointer'}
                                    width={'100%'}
                                    p={2}
                                    title={` ${chp_no} ${
                                        chap_detail?.chp_name ? ` : ${chap_detail?.chp_name}` : null
                                    }`}
                                    minWidth={'80px'}
                                    maxWidth={'250px'}
                                    borderRadius={10}
                                    alignItems="center"
                                    bg={idx === currentChapter.idx ? 'gray.800' : undefined}
                                    onClick={() =>
                                        setCurrentChapter({
                                            idx,
                                            chp_link: chap_detail.chp_link,
                                        })
                                    }>
                                    <Text noOfLines={1}>
                                        {chp_no}
                                        {chap_detail?.chp_name
                                            ? ` : ${chap_detail?.chp_name}`
                                            : null}
                                    </Text>
                                </Flex>
                            ))}
                        </>
                    ))}
                </Flex>
            ) : (
                <EpisodeSkeletons />
            )}
        </>
    );
}

function EpisodeSkeletons() {
    return (
        <Flex direction={'row'} flexWrap="wrap" width={'100%'} justifyContent="center">
            {Array(18)
                .fill(0)
                .map((item, index) => {
                    return (
                        <Skeleton p={2} m={2} width={'48px'} height={'48px'} key={index}></Skeleton>
                    );
                })}
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
                <Image src={LoaderSearchGif} alt="loader" boxSize="250px" />
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
                overflowY: 'auto',
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
