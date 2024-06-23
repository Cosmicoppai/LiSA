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
    Button,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { FiMonitor } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AddToWatchListManga } from 'src/components/AddToWatchListManga';
import { GoBackBtn } from 'src/components/GoBackBtn';

import { getMangaDetails } from './getMangaDetails';
import { Recommendations } from '../components/Recommendations';

export function MangaDetailsScreen() {
    const navigate = useNavigate();

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
            return `CHAPTERS ${data?.total_chps}`;
        }

        return '';
    }, [data]);

    const handleRead = () => {
        navigate(
            `/manga-reader?${new URLSearchParams({
                q: JSON.stringify(query),
            })}`,
        );
    };

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
                                {isLoading ? (
                                    <Skeleton
                                        height={'30px'}
                                        width={'30px'}
                                        alignSelf={'baseline'}
                                        display={'inline-block'}
                                    />
                                ) : (
                                    <AddToWatchListManga
                                        key={details?.manga_id}
                                        manga_id={details?.manga_id}
                                        session={data?.session}
                                        total_chps={data?.total_chps}
                                        poster={data?.poster}
                                        mylist={details?.mylist}
                                        genres={data?.genres}
                                        status={data?.status || ''}
                                    />
                                )}
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
                        <div
                            style={{
                                display: 'flex',
                                flexGrow: 1,
                                alignItems: 'flex-end',
                            }}>
                            {isLoading ? (
                                <Skeleton p={2} m={2} width={'48px'} height={'48px'}></Skeleton>
                            ) : (
                                <Button onClick={handleRead}>Read</Button>
                            )}
                        </div>
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
                                        <Recommendations
                                            type="manga"
                                            url={details?.recommendation}
                                        />
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
