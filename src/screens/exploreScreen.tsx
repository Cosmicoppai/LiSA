import { Center, Flex, Spacer, Stack, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiFillFilter } from 'react-icons/ai';
import { BsBookHalf } from 'react-icons/bs';
import { RiMovieFill } from 'react-icons/ri';
import { ExploreAnimeCategories } from 'src/components/ExploreAnimeCategories';
import { ExploreMangaCategories } from 'src/components/ExploreMangaCategories';
import { Tabs } from 'src/components/Tabs';

export function ExploreScreen() {
    const [type, setType] = useState<'anime' | 'manga'>('anime');
    const [category, setCategory] = useState('airing');

    useEffect(() => {
        window?.scrollTo(0, 0);
    }, []);

    return (
        <Center py={6} w="100%">
            <Stack w={{ sm: '100%', md: '90%' }} direction={'column'} padding={4}>
                <Flex
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    w={'100%'}
                    zIndex={1000}
                    backgroundColor={'var(--chakra-colors-gray-900)'}>
                    <Tabs
                        config={[
                            {
                                title: 'Anime',
                                Icon: RiMovieFill,
                                value: 'anime',
                                defaultCategoryValue: 'airing',
                            },
                            {
                                title: 'Manga',
                                Icon: BsBookHalf,
                                value: 'manga',
                                defaultCategoryValue: 'by_popularity',
                            },
                        ]}
                        currentValue={type}
                        onChange={({ value, defaultCategoryValue }) => {
                            setType(value);
                            setCategory(defaultCategoryValue);
                        }}
                    />
                    <Spacer />
                    <Select
                        maxWidth={180}
                        onChange={(e) => setCategory(e.target.value)}
                        icon={<AiFillFilter />}
                        value={category}>
                        {type === 'manga' ? (
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
                {type === 'manga' ? (
                    <ExploreMangaCategories category={category} />
                ) : (
                    <ExploreAnimeCategories category={category} />
                )}
            </Stack>
        </Center>
    );
}
