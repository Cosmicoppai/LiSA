import { createStandaloneToast } from '@chakra-ui/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { RQKEY_GET_DOWNLOADS } from 'src/components/useGetDownloads';
import server from 'src/utils/axios';

const { toast } = createStandaloneToast();

export function useDownloadVideo() {
    const queryClient = useQueryClient();

    const downloadVideo = useCallback(async (payload) => {
        try {
            const { data } = await server.post(`/download`, payload, {
                // @ts-ignore
                'Content-Type': 'application/json',
            });

            // console.log({ data });

            toast({
                title: 'Download has been started, Please check downloads section.',
                status: 'success',
                duration: 2000,
            });

            queryClient.invalidateQueries({
                queryKey: [RQKEY_GET_DOWNLOADS],
            });
        } catch (error) {
            console.log(error);

            const errMsg = error?.response?.data;

            toast({
                title: errMsg || 'Something went wrong when starting the download.',
                status: 'error',
                duration: 2000,
            });
        }
    }, []);

    return { downloadVideo };
}
