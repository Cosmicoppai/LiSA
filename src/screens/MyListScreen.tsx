import { Box, Center, Flex, Stack, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { TbMoodSad } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { AppModeSwitch } from 'src/components/AppModeSwitch';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { SkeletonCards } from 'src/components/SkeletonCards';
import { AnimeCard } from 'src/components/card';
import { SearchResultCard } from 'src/components/search-result-card';
import { useAppContext } from 'src/context/app';
import server from 'src/utils/axios';

async function getMyList({ url }) {
    const { data } = await server.get(url);
    return data;
}

export function MyListScreen() {
    const { mode } = useAppContext();

    const { data, error, isLoading } = useQuery({
        queryKey: [mode === 'manga' ? 'read-list' : 'watch-list', mode],
        queryFn: () => getMyList({ url: mode === 'manga' ? 'readlist' : '/watchlist' }),
    });

    const navigate = useNavigate();
    const exploreCardHandler = (data) => {
        navigate(
            `/manga-details?${new URLSearchParams({
                q: JSON.stringify(data),
            })}`,
        );
    };

    if (error) return <ErrorMessage error={error} />;

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
            <Center py={6} w="100%">
                <Stack flex={1} flexDirection="column" padding={4} maxWidth={'90%'}>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            marginTop: '20px',
                        }}>
                        {isLoading ? (
                            <SkeletonCards />
                        ) : (
                            data?.data?.map((item, index) =>
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
                            )
                        )}
                    </div>

                    {!isLoading && data?.data?.length === 0 ? (
                        <Flex
                            minHeight={200}
                            alignItems={'center'}
                            justifyContent="center"
                            p={3}
                            pt={2}
                            width={'100%'}>
                            <Box color="gray.500" mr="2">
                                <TbMoodSad size={24} />
                            </Box>
                            <Text
                                fontWeight={600}
                                color={'gray.500'}
                                size="lg"
                                textAlign={'center'}>
                                Your {mode === 'manga' ? 'Manga' : 'Anime'} My List is Empty
                            </Text>
                        </Flex>
                    ) : null}
                </Stack>
            </Center>
        </>
    );
}
