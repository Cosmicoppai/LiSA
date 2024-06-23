import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { SearchResultCard } from './search-result-card';
import { addAnimeDetails } from '../store/actions/animeActions';

export function AnimeCard({ data }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const detailsClickHandler = () => {
        // @ts-ignore
        dispatch(addAnimeDetails(data));
        navigate('/anime-details');
    };

    return (
        <SearchResultCard
            cardType="anime"
            onClick={detailsClickHandler}
            data={{
                ...(data as any),
                episodes: data.episodes ?? data.no_of_episodes,
                title: data.title ?? data.jp_name,
            }}
        />
    );
}
