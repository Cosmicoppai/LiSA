import { useToast } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import server from 'src/utils/axios';

import { ErrorMessage } from './ErrorMessage';
import { SkeletonCards } from './SkeletonCards';
import { SearchResultCard } from './search-result-card';
import { addAnimeDetails } from '../store/actions/animeActions';

async function getAnimeList({ category }) {
    const { data } = await server.get(`top?type=anime&c=${category}&limit=0`);
    return data;
}

export function ExploreAnimeCategories({ category }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['anime-list', category],
        queryFn: () => getAnimeList({ category }),
    });

    const navigate = useNavigate();
    const toast = useToast();

    const dispatch = useDispatch();

    const exploreCardHandler = (data) => {
        if (category === 'upcoming') {
            toast({
                title: 'Anime has not been aired yet! ❤️',
                status: 'error',
                duration: 2000,
            });
        } else {
            // @ts-ignore
            dispatch(addAnimeDetails(data));
            navigate('/anime-details');
        }
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
                data?.data?.map((data, index) => (
                    <SearchResultCard
                        key={index}
                        cardType="anime"
                        onClick={() => exploreCardHandler(data)}
                        data={{
                            poster: data.poster,
                            type: data.type,
                            rank: data.rank,
                            episodes: data.episodes,
                            score: data.score,
                            title: data.title,
                        }}
                    />
                ))
            )}
        </ul>
    );
}
