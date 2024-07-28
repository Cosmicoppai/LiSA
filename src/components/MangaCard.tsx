import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchResultCard, TSearchResultCardData } from './search-result-card';

export type TManga = TSearchResultCardData & {
    total_chps: string;
    volumes: string;
    genres: string[];
    status: string;
    manga_detail: string;
    session: string;
};

export function MangaCard({ data }: { data: TManga }) {
    const navigate = useNavigate();

    const exploreCardHandler = () => {
        navigate(
            `/manga-details?${new URLSearchParams({
                q: JSON.stringify(data),
            })}`,
        );
    };

    const episodes = useMemo(() => {
        const ep = data.total_chps || data.volumes;

        if (ep === '?') return 'Running';

        return `Chapters ${ep}`;
    }, [data]);

    return (
        <SearchResultCard
            onClick={exploreCardHandler}
            data={{
                ...data,
                episodes,
            }}
        />
    );
}
