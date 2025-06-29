import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import server from 'src/utils/axios';

export type TMangaChapter = {
    chp_link: string;
    chp_name: string;
    chp_session: string;
};

type TMangaSearch = {
    title: string;
    total_chps: string;
    genres: string[];
    poster: string;
    status: string;
    manga_detail: string;
    session: string;
};

type TMangaDetails = {
    chapters: TMangaChapter[];
    description: {
        alt_name: string;
        author: string;
        summary: string;
    };
    mylist: boolean;
    manga_id: string | number;
    recommendation: string;
};

type TGetMangaDetails = {
    data: TMangaSearch;
    details: TMangaDetails;
};

async function getMangaDetails({ url }): Promise<TGetMangaDetails> {
    const { data } = await server.get(url);

    if (String(url).includes('/search?')) {
        const detailUrl = data?.response[0]?.manga_detail;

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

export function useGetMangaDetails() {
    const [searchParams] = useSearchParams();

    const params = useMemo(() => {
        const q = searchParams.get('q');

        return JSON.parse(q) as {
            title: string;
            volumes: string;
            poster: string;
            rank: string;
            type: string;
            manga_detail: string;
            score: string;
        };
    }, [searchParams]);

    const query = useQuery({
        queryKey: ['manga-details', params?.manga_detail],
        queryFn: () => getMangaDetails({ url: params?.manga_detail }),
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
