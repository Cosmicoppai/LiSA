import { useNavigate } from 'react-router-dom';

import { SearchResultCard } from './search-result-card';

export function MangaCard({ data }) {
    const navigate = useNavigate();

    const exploreCardHandler = (data) => {
        navigate(
            `/manga-details?${new URLSearchParams({
                q: JSON.stringify(data),
            })}`,
        );
    };

    return (
        <SearchResultCard
            cardType="manga"
            onClick={() => exploreCardHandler(data)}
            data={
                {
                    poster: data.poster,
                    title: data.title,
                    episodes: data.total_chps ?? data.volumes,
                    type: data.type,
                    rank: data.rank,
                    score: data.score,
                } as any
            }
        />
    );
}
