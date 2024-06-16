import {
    Badge,
    Center,
    Flex,
    Heading,
    Image,
    Stack,
    Text,
    Icon,
    Box,
    Skeleton,
    SkeletonText,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { FiMonitor } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { AddToWatchList } from 'src/components/AddToWatchList';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { YoutubeVideo } from 'src/components/YoutubeVideo';
import server from 'src/utils/axios';

import { MangaRecommendations } from '../components/MangaRecommendations';
import { PaginateCard } from '../components/paginateCard';

type TMangaChapters = {
    [chp_no: string]: {
        chp_link: string;
        chp_name: string;
        chp_session: string;
    };
}[];

async function getMangaDetails({ url }) {
    const { data } = await server.get(url);

    const detailUrl = String(url).includes('/search?') ? data?.[0].manga_detail : url;

    const { data: details } = await server.get(detailUrl);

    return {
        data: data?.response?.[0] ?? {},
        details,
    } as {
        data: {
            title: string;
            total_chps: string;
            genres: string[];
            poster: string;
            status: string;
            manga_detail: string;
            session: string;
        };
        details: {
            chapters: TMangaChapters;
            description: {
                alt_name: string;
                author: string;
                summary: string;
                youtube_url: string;
            };
            recommendation: string;
        };
    };
}

export function MangaDetailsScreen() {
    const [searchParams, setSearchParams] = useSearchParams();

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

    const {
        data: d1,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['manga-details', query.manga_detail],
        queryFn: () => getMangaDetails({ url: query.manga_detail }),
    });

    const data = {
        ...d1?.data,
        ...query,
    };

    const details = d1?.details;

    useEffect(() => {
        if (window) {
            window?.scrollTo(0, 0);
        }
    }, [details]);

    console.log({ data, details });

    const volTxt = useMemo(() => {
        if (typeof data?.total_chps === 'string' || typeof data?.total_chps === 'number') {
            if (data?.total_chps === '?') return 'running';
            return `VOLUMES ${data?.total_chps}`;
        }

        return '';
    }, [data]);

    return (
        <Center py={6} w="100%">
            <Flex
                flexDirection={'column'}
                justifyContent="center"
                alignItems={'center'}
                w={{ sm: '90%' }}
                margin={'0 auto'}>
                <GoBackBtn />
                <Stack
                    borderWidth="1px"
                    borderRadius="lg"
                    w={'100%'}
                    justifyContent="space-between"
                    direction={{ base: 'column', md: 'row' }}
                    boxShadow={'2xl'}
                    padding={4}>
                    <Box
                        rounded={'lg'}
                        flex={1}
                        maxW={'30%'}
                        maxHeight={'500px'}
                        mt={0}
                        pos={'relative'}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        _after={{
                            transition: 'all .3s ease',
                            content: '""',
                            w: 'full',
                            h: 'full',
                            pos: 'absolute',

                            top: 5,
                            left: 0,
                            backgroundImage: `url(${data?.poster})`,
                            filter: 'blur(15px)',
                            zIndex: 1,
                        }}
                        _groupHover={{
                            _after: {
                                filter: 'blur(20px)',
                            },
                        }}>
                        <Image
                            rounded={'lg'}
                            objectFit="contain"
                            boxSize="100%"
                            src={data?.poster}
                            zIndex={2}
                        />
                    </Box>

                    <Stack
                        maxW={'65%'}
                        flex={1}
                        flexDirection="column"
                        alignItems="flex-start"
                        p={1}
                        pt={2}>
                        <Box width={'100%'}>
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                <div>
                                    <Heading fontSize={'2xl'} fontFamily={'body'} display="inline">
                                        {data?.title ? `${data?.title}` : ''}
                                    </Heading>

                                    {!isLoading ? (
                                        <Text
                                            fontWeight={600}
                                            color={'gray.500'}
                                            size="sm"
                                            display="inline"
                                            ml={1}>
                                            by {details?.description?.author}
                                        </Text>
                                    ) : (
                                        <Skeleton
                                            height={'18px'}
                                            width={'100px'}
                                            alignSelf={'baseline'}
                                            display={'inline-block'}
                                        />
                                    )}
                                </div>
                                {/* <AddToWatchList
                                    key={details?.description?.anime_id}
                                    anime_id={details?.description?.anime_id}
                                    jp_name={data.jp_name || data.title}
                                    poster={data?.poster || data?.img_url}
                                    mylist={details.mylist}
                                    no_of_episodes={data.no_of_episodes || data.episodes}
                                    type={details?.description?.type || data.type}
                                    status={details?.description?.status || ''}
                                    season={details?.description?.season || ''}
                                    year={details?.description?.year || ''}
                                    score={data.score}
                                /> */}
                            </div>
                        </Box>
                        <Text fontWeight={600} color={'gray.500'} size="sm" mb={4}>
                            {volTxt}
                        </Text>
                        <Stack align={'center'} justify={'center'} direction={'row'} mt={6}>
                            <Badge
                                px={2}
                                py={1}
                                fontWeight={'400'}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'content',
                                    alignItems: 'center',
                                }}>
                                <Icon as={FiMonitor} />
                                <Text ml="1">{data?.type}</Text>
                            </Badge>
                            {data?.status && (
                                <Badge px={2} py={1} fontWeight={'400'}>
                                    {data?.status}
                                </Badge>
                            )}
                            <Badge px={2} py={1} fontWeight={'400'}>
                                <Box display={'flex'} alignItems="center" justifyContent={'center'}>
                                    <AiFillStar color="#FDCC0D" />
                                    <Text ml={'5px'}>{data?.score ?? 'N/A'}</Text>
                                </Box>
                            </Badge>
                        </Stack>
                        {details?.description?.summary && !isLoading ? (
                            <Text color={'gray.400'} px={3} pl={0} width="100%">
                                {details?.description.summary}
                            </Text>
                        ) : (
                            <Stack align={'center'} justify={'center'} direction={'row'}>
                                <Text color={'gray.400'} width="100%" px={3} pl={0}>
                                    <SkeletonText
                                        mt="2"
                                        noOfLines={20}
                                        spacing="2"
                                        width={'100%'}
                                    />
                                </Text>
                            </Stack>
                        )}
                        <div>
                            {/* @ts-ignore */}
                            {/* <PaginateCard
                                data={data}
                                ep_details={details}
                                loading={isLoading}
                                redirect
                            /> */}
                        </div>
                        {data.genres?.length ? (
                            <div>
                                <Text fontWeight={600} color={'gray.500'} size="sm" mt={4}>
                                    Genre
                                </Text>
                                <Box>
                                    {data.genres &&
                                        data.genres.map((item, index) => {
                                            return (
                                                <Tag key={index} mr={2}>
                                                    {item}
                                                </Tag>
                                            );
                                        })}
                                </Box>
                            </div>
                        ) : null}
                        <MangaChapters isLoading={isLoading} data={details?.chapters} />
                    </Stack>
                </Stack>
                <Tabs width={'100%'} variant="enclosed" mt={5}>
                    <TabList>
                        <Tab>Recommendations</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Box>
                                <Stack
                                    mt={2}
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    justifyContent="space-between"
                                    direction={'column'}
                                    bg={'gray.900'}
                                    boxShadow={'2xl'}
                                    padding={0}
                                    w="100%">
                                    <Box
                                        sx={{
                                            marginTop: '10px',

                                            justifyContent: 'center',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                        }}>
                                        <MangaRecommendations url={details?.recommendation} />
                                    </Box>
                                </Stack>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Flex>
        </Center>
    );
}

function MangaChapters({ data }: { isLoading: boolean; data: TMangaChapters }) {
    return (
        <Box mt={5}>
            {data?.length ? (
                <Flex direction={'row'} flexWrap="wrap" width={'100%'} justifyContent="center">
                    {data?.map((item) => (
                        <>
                            {Object.entries(item).map(([chp_no, chap_detail]) => (
                                <Flex
                                    key={chp_no}
                                    cursor={'pointer'}
                                    p={1}
                                    mr={2}
                                    mt={2}
                                    width={'100%'}
                                    maxWidth={'45px'}
                                    minWidth={'45px'}
                                    maxHeight={'45px'}
                                    minHeight={'45px'}
                                    justifyContent="center"
                                    alignItems="center"
                                    bg={'brand.900'}
                                    onClick={() => alert('Under Development')}>
                                    <Text textAlign={'center'}>
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
        </Box>
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
