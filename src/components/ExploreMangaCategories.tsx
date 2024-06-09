import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import server from 'src/utils/axios';

import { ErrorMessage } from './ErrorMessage';
import { SkeletonCards } from './SkeletonCards';
import { AnimeCard } from './card';

async function getMangaList({ category }) {
    const { data } = await server.get(`top?type=manga&c=${category}&limit=0`);
    return data;
}
export function ExploreMangaCategories({ category }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['manga-list', category],
        queryFn: () => getMangaList({ category }),
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

    return (
        <>
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
                    data?.data?.map((data, index) => (
                        <AnimeCard
                            key={index}
                            onClick={() => exploreCardHandler(data)}
                            cardType="manga"
                            data={{
                                poster: data.poster || data.img_url,
                                type: data.anime_type || data.type,
                                rank: data.rank,
                                episodes: data.volumes,
                                score: data.score,
                                title: data.title,
                            }}
                        />
                    ))
                )}
            </ul>
        </>
    );
}
