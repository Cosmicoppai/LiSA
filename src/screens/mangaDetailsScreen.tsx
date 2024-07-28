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
import { useMemo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { FiMonitor } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AddToWatchListManga } from 'src/components/AddToWatchListManga';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { useGetMangaDetails } from 'src/hooks/useGetMangaDetails';

import { Recommendations } from '../components/Recommendations';

export function MangaDetailsScreen() {
    const navigate = useNavigate();

    const {
        data: { params, details },
        isLoading,
    } = useGetMangaDetails();

    const volTxt = useMemo(() => {
        if (typeof params?.total_chps === 'string' || typeof params?.total_chps === 'number') {
            if (params?.total_chps === '?') return 'running';
            return `CHAPTERS ${params?.total_chps}`;
        }

        return '';
    }, [params]);

    const handleRead = () => {
        navigate(
            `/manga-reader?${new URLSearchParams({
                q: JSON.stringify(params),
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
                                    {params?.title ? `${params?.title}` : ''}
                                </Heading>

                                {details?.manga_id ? (
                                    <AddToWatchListManga
                                        key={details?.manga_id}
                                        manga_id={details?.manga_id}
                                        session={params?.session}
                                        total_chps={params?.total_chps}
                                        poster={params?.poster}
                                        mylist={details?.mylist}
                                        genres={params?.genres || []}
                                        status={params?.status || ''}
                                    />
                                ) : (
                                    <Skeleton
                                        height={'30px'}
                                        width={'30px'}
                                        alignSelf={'baseline'}
                                        display={'inline-block'}
                                    />
                                )}
                            </div>
                            {details?.description?.author ? (
                                <Text
                                    fontWeight={600}
                                    color={'gray.500'}
                                    size="sm"
                                    display="inline">
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
                        </Box>
                        <Text fontWeight={600} color={'gray.500'} size="sm" my={4}>
                            {volTxt}
                        </Text>
                        <Stack align={'center'} justify={'center'} direction={'row'}>
                            {params?.type ? (
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
                            ) : null}
                            {params?.status && (
                                <Badge px={2} py={1} fontWeight={'400'}>
                                    {params?.status}
                                </Badge>
                            )}
                            <Badge px={2} py={1} fontWeight={'400'}>
                                <Box display={'flex'} alignItems="center" justifyContent={'center'}>
                                    <AiFillStar color="#FDCC0D" />
                                    <Text ml={'5px'}>{params?.score ?? 'N/A'}</Text>
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

                        {params.genres?.length ? (
                            <div>
                                <Text fontWeight={600} color={'gray.500'} size="sm" my={2}>
                                    Genre
                                </Text>
                                <Box>
                                    {params.genres?.map((item, index) => (
                                        <Tag key={index} mr={2}>
                                            {item}
                                        </Tag>
                                    ))}
                                </Box>
                            </div>
                        ) : null}
                        <div
                            style={{
                                display: 'flex',
                                flexGrow: 1,
                                alignItems: 'flex-end',
                            }}>
                            {details?.chapters?.length ? (
                                <Button onClick={handleRead}>Read</Button>
                            ) : isLoading ? (
                                <Skeleton p={2} m={2} width={'48px'} height={'48px'} />
                            ) : null}
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
