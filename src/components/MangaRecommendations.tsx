import { useQuery } from '@tanstack/react-query';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { SkeletonCards } from 'src/components/SkeletonCards';
import server from 'src/utils/axios';

import { MangaCard } from './MangaCard';

async function getMangaRecommendations({ url }) {
    const { data } = await server.get(url);

    return data as {
        title: string;
        total_chps: string;
        genres: string[];
        poster: string;
        status: string;
        manga_detail: string;
        session: string;
    }[];
}

export function MangaRecommendations({ url }) {
    const { data, error } = useQuery({
        queryKey: ['manga-recommendations', url],
        queryFn: () => getMangaRecommendations({ url }),
        enabled: Boolean(url),
    });

    if (error) return <ErrorMessage error={error} />;

    if (data?.length)
        return <>{data?.map?.((item, index) => <MangaCard key={index} data={item} />)}</>;

    return <SkeletonCards />;
}
