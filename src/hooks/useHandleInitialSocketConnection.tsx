import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { RQKEY_GET_DOWNLOADS, TSocketEventDownloading } from 'src/components/useGetDownloads';

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

            if (msg?.type === 'downloaded') {
                queryClient.invalidateQueries({
                    queryKey: [RQKEY_GET_DOWNLOADS],
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
