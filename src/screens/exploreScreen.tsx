import { Center, Flex, Spacer, Stack, Select } from '@chakra-ui/react';
import { useMemo } from 'react';
import { AiFillFilter } from 'react-icons/ai';
import { useSearchParams } from 'react-router-dom';
import { AppModeSwitch } from 'src/components/AppModeSwitch';
import { ExploreAnimeCategories } from 'src/components/ExploreAnimeCategories';
import { ExploreMangaCategories } from 'src/components/ExploreMangaCategories';
import { useAppContext } from 'src/context/app';

const defaultAnimeCategory = 'airing';
const defaultMangaCategory = 'by_popularity';

export function ExploreScreen() {
    const { mode } = useAppContext();

    const [searchParams, setSearchParams] = useSearchParams();

    const category = useMemo(() => {
        switch (mode) {
            case 'anime':
                return searchParams.get('anime_category') || defaultAnimeCategory;
            case 'manga':
                return searchParams.get('manga_category') || defaultMangaCategory;

            default:
                break;
        }
    }, [mode, searchParams]);

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
                <Spacer />
                <Select
                    maxWidth={180}
                    onChange={(e) => setSearchParams({ [`${mode}_category`]: e.target.value })}
                    icon={<AiFillFilter />}
                    value={category}>
                    {mode === 'manga' ? (
                        <>
                            <option value="manga">Manga</option>
                            <option value="oneshots">One Shots</option>
                            <option value="doujin">Doujin</option>
                            <option value="light_novels">Light Novels</option>
                            <option value="novels">Novels</option>
                            <option value="manhwa">Manhwa</option>
                            <option value="manhua">Manhua</option>
                            <option value="by_popularity">By Popularity</option>
                            <option value="favourite">Favorite</option>
                        </>
                    ) : (
                        <>
                            <option value="all_anime">All</option>
                            <option value="tv">TV</option>
                            <option value="movie">Movie</option>
                            <option value="airing">Airing</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="by_popularity">By Popularity</option>
                            <option value="ova">OVA</option>
                            <option value="ona">ONA</option>
                            <option value="special">Special</option>
                            <option value="favorite">Favorite</option>
                        </>
                    )}
                </Select>
            </Flex>
            <Center py={6} w="100%">
                <Stack w={{ sm: '100%', md: '90%' }} direction={'column'} padding={4}>
                    {mode === 'manga' ? (
                        <ExploreMangaCategories category={category} />
                    ) : (
                        <ExploreAnimeCategories category={category} />
                    )}
                </Stack>
            </Center>
        </>
    );
}
