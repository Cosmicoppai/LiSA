import { SearchIcon } from '@chakra-ui/icons';
import { Box, Flex, Input, InputGroup, InputLeftElement, Text, Image } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppModeSwitch } from 'src/components/AppModeSwitch';
import { AnimeCard } from 'src/components/card';
import { localImagesPath } from 'src/constants/images';
import { useAppContext } from 'src/context/app';
import server from 'src/utils/axios';

import { NetworkError } from '../components/network-error';
import { SearchResultCard } from '../components/search-result-card';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const HomeScreen = () => {
    const { isOnline } = useNetworkStatus();

    const { mode } = useAppContext();

    const [query, setQuery] = React.useState('');
    const [tempQuery, setTempQuery] = React.useState('');
    const handleSearchChange = (event) => {
        setTempQuery(event.target.value);
    };

    async function getAnimeList({ query }) {
        if (!query) return null;
        const { data } = await server.get(`/search?type=${mode}&query=${query}`);
        return data?.response ?? [];
    }

    const { data, error, isError, isLoading } = useQuery({
        queryKey: ['search-list', query, mode],
        queryFn: () => getAnimeList({ query }),
    });

    useEffect(() => {
        const c = setTimeout(() => {
            setQuery(tempQuery);
        }, 350);

        return () => clearTimeout(c);
    }, [tempQuery]);
    const navigate = useNavigate();
    const exploreCardHandler = (data) => {
        navigate(
            `/manga-details?${new URLSearchParams({
                q: JSON.stringify(data),
            })}`,
        );
    };

    return (
        <>
            <Flex
                padding={6}
                justifyContent={'space-between'}
                alignItems={'center'}
                w={'100%'}
                zIndex={1000}
                backgroundColor={'var(--chakra-colors-gray-900)'}>
                <AppModeSwitch />
            </Flex>
            <Flex w="100%" h="100%" direction="column" bg={'gray.900'}>
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
                                    children={<SearchIcon color="gray.300" />}
                                />
                                <Input
                                    sx={{ position: 'relative' }}
                                    color={'font.main'}
                                    placeholder={`Search ${mode === 'manga' ? 'Manga' : 'Anime'}`}
                                    value={tempQuery}
                                    onChange={handleSearchChange}
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
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                        borderRadius: '8px',
                                        backgroundColor: `rgba(255, 255, 255, 0.2)`,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: `rgba(255, 255, 255, 0.2)`,
                                    },
                                    justifyContent: 'center',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}>
                                {data?.map((item, index: number) =>
                                    mode === 'manga' ? (
                                        <AnimeCard
                                            key={index}
                                            onClick={() => exploreCardHandler(item)}
                                            cardType="manga"
                                            data={{
                                                poster: item.poster,
                                                type: item.type,
                                                rank: item.rank,
                                                episodes: item.total_chps,
                                                score: item.score,
                                                title: item.title,
                                            }}
                                        />
                                    ) : (
                                        <SearchResultCard key={index} data={item} />
                                    ),
                                )}
                            </Box>
                        )}
                        {isError && !isLoading && error && <NotFound />}
                        {isLoading && (
                            <Image
                                src={localImagesPath.loaderSearchGif}
                                alt="loader"
                                boxSize="150px"
                            />
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
