import server from 'src/utils/axios';

export type TAnimeEpisode = {
    ep_no: string | number;
    stream_detail: string;
    snapshot: string;
    duration: string;
};

export type TAnimeEpisodeDetails = {
    ep_details: TAnimeEpisode[];
    total_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export async function getAnimeEpisodeDetails({
    url,
}: {
    url: string;
}): Promise<TAnimeEpisodeDetails> {
    const { data } = await server.get(url);

    return data;
}
