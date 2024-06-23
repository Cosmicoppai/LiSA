import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { SearchResultCard } from './search-result-card';
import { addAnimeDetails } from '../store/actions/animeActions';

export function AnimeCard({ data, onClick }: { data: any; onClick?: () => void }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const detailsClickHandler = () => {
        // @ts-ignore
        dispatch(addAnimeDetails(data));
        navigate('/anime-details');
    };

    const episodes = useMemo(() => {
        const ep = data.episodes || data.no_of_episodes;

        if (ep === '?') return 'Running';

        return `Ep ${ep}`;
    }, [data]);

    return (
        <SearchResultCard
            onClick={onClick || detailsClickHandler}
            data={{
                ...(data as any),
                episodes,
                title: data.title ?? data.jp_name,
            }}
        />
    );
}
