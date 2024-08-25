import { createStandaloneToast } from '@chakra-ui/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { RQKEY_GET_DOWNLOADS_ACTIVE } from 'src/hooks/useGetDownloads';
import server from 'src/utils/axios';

const { toast } = createStandaloneToast();

export function useDownloadVideo() {
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(false);

    const downloadVideo = useCallback(async (payload) => {
        try {
            setIsLoading(true);
            const { data } = await server.post(`/download`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (data?.status) {
                toast({
                    title: 'Download has been started, Please check downloads section.',
                    status: 'success',
                    duration: 2000,
                });

                queryClient.invalidateQueries({
                    queryKey: [RQKEY_GET_DOWNLOADS_ACTIVE],
                });
            }
        } catch (error) {
            console.error(error);

            const errMsg = error?.response?.data;

            toast({
                title: errMsg || 'Something went wrong when starting the download.',
                status: 'error',
                duration: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { downloadVideo, downloadLoading: isLoading };
}
