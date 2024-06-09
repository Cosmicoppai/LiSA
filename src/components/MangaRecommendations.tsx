import { useQuery } from '@tanstack/react-query';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { SkeletonCards } from 'src/components/SkeletonCards';
import { AnimeCard } from 'src/components/card';
import server from 'src/utils/axios';

async function getMangaRecommendations({ url }) {
    const { data } = await server.get(url);

    return data as {
        title: string;
        total_chps: string;
        genres: string[];
        cover: string;
        status: string;
        manga_detail: string;
        session: string;
    }[];
}
export function MangaRecommendations({ url }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['manga-recommendations', url],
        queryFn: () => getMangaRecommendations({ url }),
        enabled: Boolean(url),
    });

    console.log(data);

    if (error) return <ErrorMessage error={error} />;

    if (data?.length) {
        return (
            <>
                {data?.map?.((anime, index) => {
                    return (
                        <AnimeCard
                            cardType="manga"
                            key={index}
                            onClick={() => {}}
                            data={
                                {
                                    poster: anime.cover,
                                    title: anime.title,
                                    episodes: anime.total_chps,
                                } as any
                            }
                        />
                    );
                })}
            </>
        );
    }

    return <SkeletonCards />;
}
