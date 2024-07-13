import server from 'src/utils/axios';

export type TAnimeEpisode = {
    stream_detail: string;
    snapshot: string;
    duration: string;
};

export type TAnimeEpisodes = {
    [ep_no: string]: TAnimeEpisode;
}[];

export type TAnimeEpisodeDetails = {
    ep_details: TAnimeEpisodes;
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
