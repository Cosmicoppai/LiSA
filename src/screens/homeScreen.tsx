import { SearchIcon } from '@chakra-ui/icons';
import {
    Box,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Kbd,
    Text,
    Image,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
// @ts-ignore
import HomeScreenLogoImg from 'src/assets/img/home_screen_logo.png';
// @ts-ignore
import LoaderSearchGif from 'src/assets/img/loader-serch.gif';
// @ts-ignore
import NotFoundImg from 'src/assets/img/not-found.png';
import server from 'src/utils/axios';

import { NetworkError } from '../components/network-error';
import { SearchResultCard } from '../components/search-result-card';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

async function getAnimeList({ query }) {
    if (!query) return null;
    const { data } = await server.get(`/search?type=anime&query=${query}`);
    return data;
}

export const HomeScreen = () => {
    const { isOnline } = useNetworkStatus();

    const [query, setQuery] = React.useState('');
    const [tempQuery, setTempQuery] = React.useState('');
    const handleSearchChange = (event) => {
        setTempQuery(event.target.value);
    };

    const { data, error, isLoading } = useQuery({
        queryKey: ['anime-list', query],
        queryFn: () => getAnimeList({ query }),
    });

    useEffect(() => {
        const c = setTimeout(() => {
            setQuery(tempQuery);
        }, 350);

        return () => clearTimeout(c);
    }, [tempQuery]);

    return (
        <Flex w="100%" h="100%" direction="column" bg={'gray.900'}>
            {isOnline ? (
                <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    w="100%"
                    h="100%"
                    pt={'20px'}>
                    {/* <Text
                        fontWeight='extrabold'
                        letterSpacing={3}
                        fontSize={150}
                        color={'white'}
                    >LiSA</Text> */}

                    <Image objectFit="cover" src={HomeScreenLogoImg} alt="logo" />
                    <Box w="50%" sx={{ position: 'relative', marginBottom: 8 }}>
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents="none"
                                children={<SearchIcon color="gray.300" />}
                            />

                            <Input
                                sx={{ position: 'relative' }}
                                color={'font.main'}
                                placeholder="Search Anime"
                                value={tempQuery}
                                onChange={handleSearchChange}
                            />
                            {/* <InputRightElement
                                pointerEvents="none"
                                children={
                                    <Box mr="10" p={1} px={2}>
                                        <Kbd fontSize={"1.2rem"}>Enter</Kbd>
                                    </Box>
                                }
                            /> */}
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
                            {data.map((anime, index: number) => (
                                <SearchResultCard key={index} data={anime} />
                            ))}
                        </Box>
                    )}
                    {!isLoading && error && (
                        <Box textAlign="center" py={10} px={6}>
                            <Image
                                src={NotFoundImg}
                                alt="not-found"
                                height={200}
                                display={'flex'}
                                justifyContent={'center'}
                                margin={'0 auto'}
                            />
                            <Text fontSize="18px" mt={3} mb={2}>
                                Anime Not Found
                            </Text>
                            <Text color={'gray.500'} mb={6}>
                                The result you're looking for does not seem to exist
                            </Text>
                        </Box>
                    )}
                    {isLoading && <Image src={LoaderSearchGif} alt="loader" boxSize="150px" />}
                </Flex>
            ) : (
                <NetworkError />
            )}
        </Flex>
    );
};
