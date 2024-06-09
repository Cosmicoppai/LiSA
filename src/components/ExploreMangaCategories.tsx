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
                    data?.data?.map((item, index) => (
                        <AnimeCard
                            key={index}
                            onClick={() => exploreCardHandler(item)}
                            cardType="manga"
                            data={{
                                poster: item.poster || item.img_url,
                                type: item.anime_type || item.type,
                                rank: item.rank,
                                episodes: item.volumes,
                                score: item.score,
                                title: item.title,
                            }}
                        />
                    ))
                )}
            </ul>
        </>
    );
}
