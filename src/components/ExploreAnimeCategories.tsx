import { useToast } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import server from 'src/utils/axios';

import { AnimeCard } from './AnimeCard';
import { ErrorMessage } from './ErrorMessage';
import { SkeletonCards } from './SkeletonCards';

async function getAnimeList({ category }) {
    const { data } = await server.get(`top?type=anime&c=${category}&limit=0`);
    return data;
}

export function ExploreAnimeCategories({ category }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['anime-list', category],
        queryFn: () => getAnimeList({ category }),
    });

    const toast = useToast();

    const handleUpcomingAnimes = () => {
        toast({
            title: 'Anime has not been aired yet! ❤️',
            status: 'error',
            duration: 2000,
        });
    };

    if (error) return <ErrorMessage error={error} />;

    return (
        <ul
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
                data?.data?.map((item, index) => (
                    <AnimeCard
                        key={index}
                        onClick={category === 'upcoming' ? handleUpcomingAnimes : undefined}
                        data={item}
                    />
                ))
            )}
        </ul>
    );
}
