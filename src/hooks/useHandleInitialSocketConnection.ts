import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
    RQKEY_GET_DOWNLOADS_ACTIVE,
    RQKEY_GET_DOWNLOADS_HISTORY,
    TSocketEventDownloading,
} from 'src/hooks/useGetDownloads';

import { useSocketContext } from '../context/socket';
import { TCookieReq } from '../types';

export function useHandleInitialSocketConnection() {
    const { socket, isSocketConnected } = useSocketContext();

    const [isDomainCookiesGenerating, setIsDomainCookiesGenerating] = useState(false);

    // Get QueryClient from the context
    const queryClient = useQueryClient();

    const handleCookieGeneration = useCallback(
        async (msg: TCookieReq) => {
            if (isDomainCookiesGenerating) {
                console.log('Cookie Generation: Ignored');
                return;
            }

            try {
                setIsDomainCookiesGenerating(true);
                const cookies = await window?.electronAPI?.getDomainCookies(msg);
                socket.send(
                    JSON.stringify({
                        type: 'cookie_request',
                        data: cookies,
                    }),
                );
            } catch (error) {
                console.error('Cookie Generation: Error', error);
            } finally {
                setIsDomainCookiesGenerating(false);
            }
        },
        [socket, isDomainCookiesGenerating],
    );

    const handleDownloads = useCallback(
        (msg: TSocketEventDownloading) => {
            if (msg.data?.status !== 'downloaded') return;

            // Refetch the downloading count when any download item finished downloading.
            queryClient.invalidateQueries({
                queryKey: [RQKEY_GET_DOWNLOADS_ACTIVE],
            });
            queryClient.invalidateQueries({
                queryKey: [RQKEY_GET_DOWNLOADS_HISTORY],
            });
        },
        [queryClient],
    );

    const handleSocketConnection = useCallback(
        async (ev: MessageEvent<any>) => {
            const msg: TCookieReq | TSocketEventDownloading =
                typeof ev?.data === 'string' ? JSON.parse(ev?.data) : null;

            console.log('socket event', msg);

            switch (msg?.type) {
                case 'downloads':
                    handleDownloads(msg);
                    break;
                case 'cookie_request':
                    await handleCookieGeneration(msg);
                    break;
                default:
                    break;
            }
        },
        [socket, handleDownloads, handleCookieGeneration],
    );

    useEffect(() => {
        if (!socket || !isSocketConnected) return;

        socket.send(JSON.stringify({ type: 'connect' }));
        console.log('WebSocket Client Connected');

        socket.addEventListener('message', handleSocketConnection);

        return () => socket.removeEventListener('message', handleSocketConnection);
    }, [isSocketConnected, socket, handleSocketConnection]);
}
