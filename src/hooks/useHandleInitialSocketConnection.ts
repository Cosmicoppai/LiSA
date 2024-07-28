import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import {
    RQKEY_GET_DOWNLOADS_ACTIVE,
    RQKEY_GET_DOWNLOADS_HISTORY,
    TSocketEventDownloading,
} from 'src/components/useGetDownloads';

import { useSocketContext } from '../context/socket';
import { TCookieReq } from '../types';

export function useHandleInitialSocketConnection() {
    const { socket, isSocketConnected } = useSocketContext();

    // Get QueryClient from the context
    const queryClient = useQueryClient();

    const handleSocketConnection = useCallback(
        (ev: MessageEvent<any>) => {
            const msg: TCookieReq | TSocketEventDownloading =
                typeof ev?.data === 'string' ? JSON.parse(ev?.data) : null;

            console.log('socket event', msg);
            if (msg?.type === 'cookie_request') {
                window?.electronAPI?.getDomainCookies(msg).then((response) => {
                    socket.send(
                        JSON.stringify({
                            type: 'cookie_request',
                            data: response,
                        }),
                    );
                });
            }

            // Refetch the downloading count when any download item finished downloading.
            if (msg?.type === 'downloads' && msg.data?.status === 'downloaded') {
                queryClient.invalidateQueries({
                    queryKey: [RQKEY_GET_DOWNLOADS_ACTIVE],
                });
                queryClient.invalidateQueries({
                    queryKey: [RQKEY_GET_DOWNLOADS_HISTORY],
                });
            }
        },
        [socket, window],
    );

    useEffect(() => {
        if (!socket || !isSocketConnected) return;

        socket.send(JSON.stringify({ type: 'connect' }));
        console.log('WebSocket Client Connected');

        socket.addEventListener('message', handleSocketConnection);

        return () => socket.removeEventListener('message', handleSocketConnection);
    }, [isSocketConnected, socket, handleSocketConnection]);
}
