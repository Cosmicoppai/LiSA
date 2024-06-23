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
import { useEffect } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { FiMonitor } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { AddToWatchList } from 'src/components/AddToWatchList';
import { AnimeCard } from 'src/components/AnimeCard';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { SkeletonCards } from 'src/components/SkeletonCards';
import { YoutubeVideo } from 'src/components/YoutubeVideo';
import { openExternalUrl } from 'src/utils/fn';

import { PaginateCard } from '../components/paginateCard';
import { getRecommendations } from '../store/actions/animeActions';

export function AnimeDetailsScreen() {
    const dispatch = useDispatch();

    // @ts-ignore
    const { details: data } = useSelector((state) => state.animeDetails);
    // @ts-ignore
    const { details, loading: ep_loading } = useSelector((state) => state.animeEpisodesDetails);

    const { details: recommendations } = useSelector(
        // @ts-ignore
        (state) => state.animeRecommendations,
    );

    useEffect(() => {
        if (window) {
            window?.scrollTo(0, 0);
        }

        if (details.recommendation) {
            // @ts-ignore
            dispatch(getRecommendations(details.recommendation));
        }
    }, [details]);

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
                            backgroundImage: `url(${data?.poster || data?.img_url})`,
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
                            src={data?.poster || data?.img_url}
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
                                        {data.jp_name ? `${data.jp_name}` : ''}{' '}
                                        {data.title ? `${data.title}` : ''}
                                    </Heading>

                                    {!ep_loading ? (
                                        <Text
                                            fontWeight={600}
                                            color={'gray.500'}
                                            size="sm"
                                            display="inline"
                                            ml={1}>
                                            by {details?.description?.studio}
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
                                {ep_loading ? (
                                    <Skeleton
                                        height={'30px'}
                                        width={'30px'}
                                        alignSelf={'baseline'}
                                        display={'inline-block'}
                                    />
                                ) : (
                                    <AddToWatchList
                                        key={details?.description?.anime_id}
                                        anime_id={details?.description?.anime_id}
                                        jp_name={data.jp_name || data.title}
                                        poster={data?.poster || data?.img_url}
                                        mylist={details.mylist}
                                        no_of_episodes={data.no_of_episodes || data?.episodes}
                                        type={details?.description?.type || data?.type}
                                        status={details?.description?.status || ''}
                                        season={details?.description?.season || ''}
                                        year={details?.description?.year || ''}
                                        score={data?.score}
                                    />
                                )}
                            </div>
                            {!ep_loading ? (
                                <Heading fontSize={'xl'} fontFamily={'body'} display="block">
                                    {details?.description?.eng_name
                                        ? `${details?.description?.eng_name}`
                                        : ''}
                                </Heading>
                            ) : (
                                <Skeleton
                                    height={'18px'}
                                    width={'100px'}
                                    alignSelf={'baseline'}
                                    display={'block'}
                                />
                            )}
                        </Box>
                        <Text fontWeight={600} color={'gray.500'} size="sm" mb={4}>
                            No of episodes{' '}
                            {data.no_of_episodes !== '?' ? data.no_of_episodes : 'running'}
                            {data.episodes !== '?' ? data.episodes : 'running'}
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
                                <Text ml="1">{data.type}</Text>
                            </Badge>
                            {data.status && (
                                <Badge px={2} py={1} fontWeight={'400'}>
                                    {data.status}
                                </Badge>
                            )}
                            <Badge px={2} py={1} fontWeight={'400'}>
                                <Box display={'flex'} alignItems="center" justifyContent={'center'}>
                                    <AiFillStar color="#FDCC0D" />
                                    <Text ml={'5px'}>{data.score}</Text>
                                </Box>
                            </Badge>
                        </Stack>
                        {details?.description?.synopsis && !ep_loading ? (
                            <Text color={'gray.400'} px={3} pl={0} width="100%">
                                {details?.description?.synopsis}
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
                            <PaginateCard
                                data={data}
                                ep_details={details}
                                loading={ep_loading}
                                redirect
                            />
                        </div>
                        <div>
                            <Text fontWeight={600} color={'gray.500'} size="sm" mt={4}>
                                External Links
                            </Text>
                            <Box>
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
                            </Box>
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
                            <YoutubeVideo url={details?.description?.youtube_url} />
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
                                        {recommendations ? (
                                            recommendations.map((anime, index) => (
                                                <AnimeCard key={index} data={anime} />
                                            ))
                                        ) : (
                                            <SkeletonCards />
                                        )}
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
