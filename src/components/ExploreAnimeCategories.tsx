import { useQuery } from '@tanstack/react-query';
import server from 'src/utils/axios';

import { ErrorMessage } from './ErrorMessage';
import { SkeletonCards } from './SkeletonCards';
import { Card } from './card';

async function getAnimeList({ category }) {
    const { data } = await server.get(`top?type=anime&c=${category}&limit=0`);
    return data;
}

export function ExploreAnimeCategories({ category }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['anime-list', category],
        queryFn: () => getAnimeList({ category }),
    });

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
                data?.data?.map((anime, index) => (
                    <Card key={index} data={anime} query={category} />
                ))
            )}
        </ul>
    );
}
