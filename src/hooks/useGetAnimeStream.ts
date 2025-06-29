import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import server from 'src/utils/axios';

import { TAnimeEpisode } from './useGetAnimeEpisodeDetails';

type TAnimeStreamDetails = { [language: string]: string };

async function getAnimeStream({ url }): Promise<TAnimeStreamDetails> {
    const { data } = await server.get(url);

    return data;
}

export function useGetAnimeStream() {
    const [searchParams] = useSearchParams();
    const stream = searchParams.get('stream');

    const params = useMemo(() => {
        return JSON.parse(stream) as TAnimeEpisode;
    }, [stream]);

    const query = useQuery({
        queryKey: ['anime-stream', params?.stream_detail],
        queryFn: () => getAnimeStream({ url: params?.stream_detail }),
        enabled: Boolean(params?.stream_detail),
    });

    return {
        ...query,
        data: {
            animeEpisode: params,
            streamDetails: query.data,
        },
    };
}
