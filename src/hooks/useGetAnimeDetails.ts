import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import server from 'src/utils/axios';

import { TAnimeEpisodeDetails } from './useGetAnimeEpisodeDetails';

type TAnimeSearch = {
    title: string;
    jp_name: string;
    no_of_episodes: number | string;
    episodes: number | string;
    type: string;
    status: string;
    season: string;
    year: number;
    score: number;
    session: string;
    poster: string;
    ep_details: string;
    anime_id: number;
};

type TAnimeDetails = TAnimeEpisodeDetails & {
    recommendation: string;
    description: {
        synopsis: string;
        eng_name: string | null;
        studio: string;
        youtube_url: string | null;
        external_links: {
            AniList: string;
            Kitsu: string;
            AniDB: string;
            AnimeNewsNetwork: string;
            MyAnimeList: string;
        };
        anime_id: number;
        type: string;
        status: string;
        aired: string;
        season: string;
        year: string;
        duration: string;
        themes: string[];
    };
    mylist: false;
};

type TGetAnimeDetails = {
    data: TAnimeSearch;
    details: TAnimeDetails;
};

async function getAnimeDetails({ url }: { url: string }): Promise<TGetAnimeDetails> {
    const { data } = await server.get(url);

    if (String(url).includes('/search?')) {
        const detailUrl = data?.response[0]?.ep_details;

        const { data: details } = await server.get(detailUrl);

        return {
            data: data?.response?.[0] ?? {},
            details,
        };
    }

    return {
        data: {} as any,
        details: data,
    };
}

export function useGetAnimeDetails() {
    const [searchParams] = useSearchParams();

    const params = useMemo(() => {
        const q = searchParams.get('q');

        return JSON.parse(q) as {
            title: string;
            volumes: string;
            poster: string;
            rank: string;
            type: string;
            anime_detail: string;
            ep_details: string;
            score: string;
        };
    }, [searchParams]);

    const query = useQuery({
        queryKey: ['anime-details', params?.anime_detail, params?.ep_details],
        queryFn: () => getAnimeDetails({ url: params?.ep_details || params?.anime_detail }),
    });

    return {
        ...query,
        data: {
            params: {
                ...query.data?.data,
                ...params,
            },
            details: query.data?.details,
        },
    };
}
