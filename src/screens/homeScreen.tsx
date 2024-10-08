import { Box, Flex, Input, InputGroup, InputLeftElement, Text, Image } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { useSearchParams } from 'react-router-dom';
import { AnimeCard } from 'src/components/AnimeCard';
import { AppModeSwitch } from 'src/components/AppModeSwitch';
import { localImagesPath } from 'src/constants/images';
import { useAppContext } from 'src/context/app';
import server from 'src/utils/axios';

import { MangaCard } from '../components/MangaCard';
import { NetworkError } from '../components/network-error';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function useSearchQuery() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [search, setSearch] = useState(searchQuery);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchParams({ search: search.trim() });
        }, 450);
        return () => clearTimeout(timeoutId);
    }, [search, setSearchParams]);

    return {
        searchQuery,
        search,
        setSearch,
    };
}

async function getAnimeList({ query, type }) {
    if (!query) return null;

    const { data } = await server.get(
        `/search?${new URLSearchParams({
            type,
            query,
        })}`,
    );
    return data?.response ?? [];
}

export const HomeScreen = () => {
    const { isOnline } = useNetworkStatus();

    const { mode } = useAppContext();

    const { search, searchQuery, setSearch } = useSearchQuery();

    const { data, error, isError, isLoading, isFetching } = useQuery({
        queryKey: ['search-list', searchQuery, mode],
        queryFn: () => getAnimeList({ query: searchQuery, type: mode }),
        enabled: searchQuery.length > 0,
    });

    const [isTakingLonger, setIsTakingLonger] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const timeOut = setTimeout(() => {
                setIsTakingLonger(true);
            }, 5000);

            return () => {
                clearTimeout(timeOut);
            };
        }

        setIsTakingLonger(false);
    }, [isLoading]);

    return (
        <>
            <Flex
                padding={6}
                justifyContent={'space-between'}
                alignItems={'center'}
                w={'100%'}
                zIndex={1000}>
                <AppModeSwitch />
            </Flex>
            <Flex w="100%" h="100%" marginTop={'180px'} direction="column">
                {isOnline ? (
                    <Flex
                        align="center"
                        justify="center"
                        direction="column"
                        w="100%"
                        h="100%"
                        pt={'20px'}>
                        <Image objectFit="cover" src={localImagesPath.homeScreenLogo} alt="logo" />
                        <Box w="50%" sx={{ position: 'relative', marginBottom: 8 }}>
                            <InputGroup>
                                <InputLeftElement
                                    pointerEvents="none"
                                    children={<IoIosSearch color="gray.300" size={22} />}
                                />
                                <Input
                                    sx={{ position: 'relative' }}
                                    color={'font.main'}
                                    placeholder={`Search ${mode === 'manga' ? 'Manga' : 'Anime'}`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    spellCheck="false"
                                />
                            </InputGroup>
                        </Box>
                        {!isLoading && data && (
                            <Box
                                sx={{
                                    marginTop: '10px',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    height: '100%',
                                    width: '100%',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}>
                                {data?.map((item, index: number) =>
                                    mode === 'manga' ? (
                                        <MangaCard key={index} data={item} />
                                    ) : (
                                        <AnimeCard key={index} data={item} />
                                    ),
                                )}
                            </Box>
                        )}
                        {isError && error && !isLoading && !isFetching ? <NotFound /> : null}
                        {isLoading && (
                            <div
                                style={{
                                    width: '100%',
                                    rowGap: 30,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Image
                                    src={localImagesPath.loaderSearchGif}
                                    alt="loader"
                                    boxSize="150px"
                                />
                                {isTakingLonger ? (
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                        }}>
                                        It's taking longer than usual
                                    </span>
                                ) : null}
                            </div>
                        )}
                    </Flex>
                ) : (
                    <NetworkError />
                )}
            </Flex>
        </>
    );
};

function NotFound() {
    const { mode } = useAppContext();

    return (
        <Box textAlign="center" py={10} px={6}>
            <Image
                src={localImagesPath.notFound}
                alt="not-found"
                height={200}
                display={'flex'}
                justifyContent={'center'}
                margin={'0 auto'}
            />
            <Text fontSize="18px" mt={3} mb={2} textTransform={'capitalize'}>
                {mode} Not Found
            </Text>
            <Text color={'gray.500'} mb={6}>
                The result you're looking for does not seem to exist
            </Text>
        </Box>
    );
}
