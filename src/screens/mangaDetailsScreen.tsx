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
import { useEffect } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { FiMonitor } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { AddToWatchList } from 'src/components/AddToWatchList';
import { GoBackBtn } from 'src/components/GoBackBtn';
import server from 'src/utils/axios';
import { openExternalUrl } from 'src/utils/fn';

import { MangaRecommendations } from '../components/MangaRecommendations';
import { PaginateCard } from '../components/paginateCard';
import { SearchResultCard } from '../components/search-result-card';

async function getMangaDetails({ url }) {
    const { data } = await server.get(url);

    const detailUrl = data?.response[0].manga_detail;

    const { data: details } = await server.get(detailUrl);

    return {
        data: data?.response?.[0] ?? {},
        details,
    } as {
        data: {
            title: string;
            total_chps: string;
            genres: string[];
            cover: string;
            status: string;
            manga_detail: string;
            session: string;
        };
        details: {
            chapters: {
                [chp_no: string]: {
                    chp_link: string;
                    chp_name: string;
                    chp_session: string;
                };
            }[];
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

    const {
        data: d1,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['manga-details', searchParams.get('manga_detail')],
        queryFn: () => getMangaDetails({ url: searchParams.get('manga_detail') }),
    });

    const data = d1?.data;
    const details = d1?.details;

    useEffect(() => {
        if (window) {
            window?.scrollTo(0, 0);
        }
    }, [details]);

    function ytToEmbeded(input) {
        return input.split('?')[1].slice(2);
    }

    console.log({ data, details });

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
                            backgroundImage: `url(${data?.cover})`,
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
                            src={data?.cover}
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
                            No of Volumes {data?.total_chps !== '?' ? data?.total_chps : 'running'}
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
                                {/* <Text ml="1">{data?.type}</Text> */}
                            </Badge>
                            {data?.status && (
                                <Badge px={2} py={1} fontWeight={'400'}>
                                    {data?.status}
                                </Badge>
                            )}
                            <Badge px={2} py={1} fontWeight={'400'}>
                                <Box display={'flex'} alignItems="center" justifyContent={'center'}>
                                    <AiFillStar color="#FDCC0D" />
                                    {/* <Text ml={'5px'}>{data?.score}</Text> */}
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
                                recommendationLoading={false}
                                data={data}
                                ep_details={details}
                                loading={isLoading}
                                redirect
                            /> */}
                        </div>
                        <div>
                            <Text fontWeight={600} color={'gray.500'} size="sm" mt={4}>
                                External Links
                            </Text>
                            {/* <Box>
                                {details?.description &&
                                    Object.entries(details?.description?.external_links).map(
                                        ([key, value], index) => {
                                            return (
                                                <Tag
                                                    key={index}
                                                    onClick={() => openExternalUrl(value as string)}
                                                    mr={2}
                                                    sx={{ cursor: 'pointer' }}>
                                                    {key}
                                                </Tag>
                                            );
                                        },
                                    )}
                            </Box> */}
                        </div>
                    </Stack>
                </Stack>
                <Tabs width={'100%'} variant="enclosed" mt={5}>
                    <TabList>
                        <Tab>Trailer </Tab>
                        <Tab>Recommendations</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            {details?.description?.youtube_url ? (
                                <Stack
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    w={'100%'}
                                    justifyContent="space-between"
                                    boxShadow={'2xl'}>
                                    <div
                                        style={{
                                            overflow: 'hidden',
                                            paddingBottom: '56.25%',
                                            position: 'relative',
                                            height: 0,
                                        }}>
                                        <iframe
                                            width="853"
                                            style={{
                                                left: 0,
                                                top: 0,
                                                height: '100%',
                                                width: '100%',
                                                position: 'absolute',
                                            }}
                                            height="480"
                                            src={`https://www.youtube.com/embed/${ytToEmbeded(
                                                details?.description?.youtube_url,
                                            )}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                                        />
                                    </div>
                                </Stack>
                            ) : (
                                <Box>
                                    <Text>No trailer available</Text>
                                </Box>
                            )}
                        </TabPanel>
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
                                            // position: "absolute",
                                            // top: 0,
                                            marginTop: '10px',

                                            justifyContent: 'center',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                        }}>
                                        <MangaRecommendations url={details?.recommendation} />
                                        {/* {recommendations ? (
                                            recommendations.map((anime, index) => {
                                                return (
                                                    // @ts-ignore
                                                    <SearchResultCard
                                                        key={index}
                                                        data={anime}
                                                        cardWidth={'270px'}
                                                        cardMargin={'10px 40px'}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <SkeletonCards />
                                        )} */}
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
