import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchResultCard } from './search-result-card';

export function AnimeCard({ data, onClick }: { data: any; onClick?: () => void }) {
    const navigate = useNavigate();

    const detailsClickHandler = () => {
        navigate(
            `/anime-details?${new URLSearchParams({
                q: JSON.stringify(data),
            })}`,
        );
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
                ...data,
                episodes,
                title: data.title ?? data.jp_name,
            }}
        />
    );
}
