import { useQuery } from '@tanstack/react-query';
import server from 'src/utils/axios';

import { ErrorMessage } from './ErrorMessage';
import { MangaCard } from './MangaCard';
import { SkeletonCards } from './SkeletonCards';

async function getMangaList({ category }) {
    const { data } = await server.get(`top?type=manga&c=${category}&limit=0`);
    return data;
}

export function ExploreMangaCategories({ category }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['manga-list', category],
        queryFn: () => getMangaList({ category }),
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
                    <MangaCard key={index} data={anime} query={category} />
                ))
            )}
        </ul>
    );
}
