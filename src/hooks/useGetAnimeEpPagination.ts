import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { useGetAnimeDetails } from './useGetAnimeDetails';
import { getAnimeEpisodeDetails } from './useGetAnimeEpisodeDetails';

export function useGetAnimeEpPagination() {
    const {
        data: { params },
    } = useGetAnimeDetails();

    const [searchParams, setSearchParams] = useSearchParams();

    const episodePageUrl = searchParams.get('episodePageUrl') || params?.ep_details;

    function setEpisodePageUrl(url) {
        setSearchParams('episodePageUrl', url);
    }

    const query = useQuery({
        queryKey: ['anime-ep-details', episodePageUrl],
        queryFn: () => getAnimeEpisodeDetails({ url: episodePageUrl }),
    });

    return {
        ...query,
        episodePageUrl,
        onPrevPage: () => setEpisodePageUrl(query.data?.prev_page_url),
        onNextPage: () => setEpisodePageUrl(query.data?.next_page_url),
    };
}
