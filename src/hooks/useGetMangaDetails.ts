import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import server from 'src/utils/axios';

export type TMangaChapter = {
    chp_link: string;
    chp_name: string;
    chp_session: string;
};

export type TMangaChapters = {
    [chp_no: string]: TMangaChapter;
}[];

async function getMangaDetails({ url }) {
    const { data } = await server.get(url);

    const detailUrl = String(url).includes('/search?') ? data?.response[0].manga_detail : url;

    const { data: details } = await server.get(detailUrl);

    return {
        data: data?.response?.[0] ?? {},
        details,
    } as {
        data: {
            title: string;
            total_chps: string;
            genres: string[];
            poster: string;
            status: string;
            manga_detail: string;
            session: string;
        };
        details: {
            chapters: TMangaChapters;
            description: {
                alt_name: string;
                author: string;
                summary: string;
            };
            mylist: boolean;
            manga_id: string | number;
            recommendation: string;
        };
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
