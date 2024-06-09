import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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

    const navigate = useNavigate();

    const exploreCardHandler = (data) => {
        navigate(
            `/manga-details?${new URLSearchParams({
                manga_detail: data.manga_detail,
            })}`,
        );
    };

    if (error) return <ErrorMessage error={error} />;

    if (data?.length) {
        return (
            <>
                {data?.map?.((item, index) => {
                    return (
                        <AnimeCard
                            key={index}
                            cardType="manga"
                            onClick={() => exploreCardHandler(item)}
                            data={
                                {
                                    poster: item.cover,
                                    title: item.title,
                                    episodes: item.total_chps,
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
