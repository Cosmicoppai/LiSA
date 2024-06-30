import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import server from 'src/utils/axios';

export type TDownload = {
    id: number;
    type: 'video';
    series_name: string;
    file_name: string;
    status: 'downloaded' | 'paused' | 'started' | 'scheduled';
    created_on: string;
    total_size: number;
    file_location: string;
    downloaded: number;
    speed: number;
};

export type TSocketEventDownloading = {
    data: TDownload;
    type: 'downloads';
};

async function getDownloads(): Promise<TDownload[]> {
    const { data } = await server.get('/library');
    return data;
}

export const RQKEY_GET_DOWNLOADS = 'downloads';

export function useGetDownloads() {
    return useQuery({
        queryKey: [RQKEY_GET_DOWNLOADS],
        queryFn: getDownloads,
        initialData: [],
        placeholderData: [],
    });
}

export function useDownloadingActions(id: TDownload['id'][]) {
    // Get QueryClient from the context
    const queryClient = useQueryClient();

    const cancelDownload = useCallback(async () => {
        try {
            const res = await server.post(
                `/download/cancel`,
                {
                    id,
                },
                {
                    // @ts-ignore
                    'Content-Type': 'application/json',
                },
            );

            if (res.status === 200) {
            }
        } catch (error) {
            console.log(error);
        } finally {
            queryClient.invalidateQueries({
                queryKey: [RQKEY_GET_DOWNLOADS],
            });
        }
    }, [queryClient, id]);

    const pauseDownload = useCallback(async () => {
        try {
            const res = await server.post(
                `/download/pause`,
                {
                    id,
                },
                {
                    // @ts-ignore
                    'Content-Type': 'application/json',
                },
            );

            if (res.status === 200) return true;
        } catch (error) {
            console.log(error);
        }
    }, [queryClient, id]);

    const resumeDownload = useCallback(async () => {
        try {
            const res = await server.post(
                `/download/resume`,
                {
                    id,
                },
                {
                    // @ts-ignore
                    'Content-Type': 'application/json',
                },
            );

            if (res.status === 200) return true;
        } catch (error) {
            console.log(error);
        }
    }, [queryClient, id]);

    return { cancelDownload, pauseDownload, resumeDownload };
}
