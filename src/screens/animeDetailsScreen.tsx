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
import { AiFillStar } from 'react-icons/ai';
import { FiMonitor } from 'react-icons/fi';
import { AddToWatchList } from 'src/components/AddToWatchList';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { Recommendations } from 'src/components/Recommendations';
import { YoutubeVideo } from 'src/components/YoutubeVideo';
import { useGetAnimeDetails } from 'src/hooks/useGetAnimeDetails';
import { openExternalUrl } from 'src/utils/fn';

import { PaginateCard } from '../components/paginateCard';

export function AnimeDetailsScreen() {
    const {
        data: { details, params },
        error,
        isError,
        isLoading,
    } = useGetAnimeDetails();

    const ep = params?.no_of_episodes || params?.episodes;

    if (isError) return <ErrorMessage error={error} />;

    const external_links = details?.description?.external_links;

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
                            backgroundImage: `url(${params?.poster})`,
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
                            src={params?.poster}
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
                                <Heading fontSize={'2xl'} fontFamily={'body'} display="inline">
                                    {params?.jp_name ? `${params?.jp_name}` : ''}{' '}
                                    {params?.title ? `${params?.title}` : ''}
                                </Heading>

                                {isLoading ? (
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
                                        jp_name={params?.jp_name || params?.title}
                                        poster={params?.poster}
                                        mylist={details?.mylist}
                                        no_of_episodes={params?.no_of_episodes || params?.episodes}
                                        type={details?.description?.type || params?.type}
                                        status={details?.description?.status || ''}
                                        season={details?.description?.season || ''}
                                        year={details?.description?.year || ''}
                                        score={params?.score}
                                    />
                                )}
                            </div>
                            {details?.description?.eng_name ? (
                                <Heading fontSize={'medium'} fontFamily={'body'} display="block">
                                    {details?.description?.eng_name}
                                </Heading>
                            ) : isLoading ? (
                                <Skeleton
                                    height={'18px'}
                                    width={'100px'}
                                    alignSelf={'baseline'}
                                    display={'block'}
                                />
                            ) : null}
                            {details?.description?.studio ? (
                                <Text
                                    fontWeight={600}
                                    color={'gray.500'}
                                    size="sm"
                                    display="inline">
                                    by {details?.description?.studio}
                                </Text>
                            ) : isLoading ? (
                                <Skeleton
                                    height={'18px'}
                                    width={'100px'}
                                    alignSelf={'baseline'}
                                    display={'inline-block'}
                                />
                            ) : null}
                        </Box>
                        {ep && ep !== 1 ? (
                            <Text fontWeight={600} color={'gray.500'} size="sm" my={2}>
                                {ep === '?' ? 'Running' : `Episodes ${ep}`}
                            </Text>
                        ) : null}
                        <Stack align={'center'} justify={'center'} direction={'row'} my={3}>
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
                                <Text ml="1">{params?.type}</Text>
                            </Badge>
                            {params?.status && (
                                <Badge px={2} py={1} fontWeight={'400'}>
                                    {params?.status}
                                </Badge>
                            )}
                            <Badge px={2} py={1} fontWeight={'400'}>
                                <Box display={'flex'} alignItems="center" justifyContent={'center'}>
                                    <AiFillStar color="#FDCC0D" />
                                    <Text ml={'5px'}>{params?.score}</Text>
                                </Box>
                            </Badge>
                        </Stack>
                        {details?.description?.synopsis ? (
                            <Text color={'gray.400'} px={3} pl={0} width="100%">
                                {details?.description?.synopsis}
                            </Text>
                        ) : isLoading ? (
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
                        ) : null}
                        {external_links && (
                            <>
                                <Text fontWeight={600} color={'gray.500'} size="sm" my={4}>
                                    External Links
                                </Text>
                                <div
                                    style={{
                                        display: 'flex',
                                        columnGap: 8,
                                        flexWrap: 'wrap',
                                        rowGap: 8,
                                    }}>
                                    {Object.entries(external_links).map(
                                        ([link_name, link_href]) => (
                                            <Tag
                                                key={link_name}
                                                title={link_href}
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => openExternalUrl(link_href)}>
                                                {link_name}
                                            </Tag>
                                        ),
                                    )}
                                </div>
                            </>
                        )}
                        <PaginateCard />
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
                                            type="anime"
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
