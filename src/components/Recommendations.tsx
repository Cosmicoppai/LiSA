import { useQuery } from '@tanstack/react-query';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { SkeletonCards } from 'src/components/SkeletonCards';
import server from 'src/utils/axios';

import { AnimeCard } from './AnimeCard';
import { MangaCard } from './MangaCard';

async function getRecommendations({ url }) {
    const { data } = await server.get(url);
    return data as any[];
}

export function Recommendations({ url, type }: { url: string; type: 'manga' | 'anime' }) {
    const { data, error } = useQuery({
        queryKey: ['recommendations', url],
        queryFn: () => getRecommendations({ url }),
        enabled: Boolean(url),
    });

    if (error) return <ErrorMessage error={error} />;

    if (data?.length === 0)
        return (
            <span style={{ textAlign: 'center', marginTop: 100, marginBottom: 100 }}>
                {'Recommendations not available.'}
            </span>
        );

    if (data?.length) {
        return (
            <>
                {data?.map?.((item, index) =>
                    type === 'manga' ? (
                        <MangaCard key={index} data={item} />
                    ) : (
                        <AnimeCard key={index} data={item} />
                    ),
                )}
            </>
        );
    }

    return <SkeletonCards />;
}
