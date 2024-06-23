import { Box, Progress, Td, Text, Tr } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { AiOutlineClose, AiOutlinePause } from 'react-icons/ai';
import { FaPlay } from 'react-icons/fa';
import { useSocketContext } from 'src/context/socket';
import { formatBytes } from 'src/utils/formatBytes';

import {
    RQKEY_GET_DOWNLOADS,
    TSocketEventDownloading,
    useDownloadingActions,
} from './useGetDownloads';

export function DownloadItem({ data: fetchedData }) {
    const { cancelDownload, pauseDownload, resumeDownload } = useDownloadingActions([
        fetchedData.id,
    ]);

    const pauseDownloadHandler = async () => {
        if (await pauseDownload()) {
            setSocketData({
                ...data,
                status: 'paused',
            });
        }
    };

    const resumeDownloadHandler = async () => {
        if (await resumeDownload()) {
            setSocketData({
                ...data,
                status: 'scheduled',
            });
        }
    };

    const [data, setSocketData] = useState<TSocketEventDownloading['data']>(fetchedData);

    const { socket, isSocketConnected } = useSocketContext();

    // Get QueryClient from the context
    const queryClient = useQueryClient();

    const handleSocketConnection = useCallback(
        (ev: MessageEvent<any>) => {
            const msg: TSocketEventDownloading =
                typeof ev?.data === 'string' ? JSON.parse(ev?.data) : null;

            if (msg?.type === 'downloading' && msg.data.id === fetchedData.id) {
                console.log('download message', msg);
                setSocketData({
                    ...fetchedData,
                    ...msg.data,
                });
            }
            if (msg?.type === 'downloaded' && msg.data.id === fetchedData.id) {
                queryClient.invalidateQueries({
                    queryKey: [RQKEY_GET_DOWNLOADS],
                });
            }
        },
        [socket, window, data],
    );

    useEffect(() => {
        if (!socket || !isSocketConnected) return;

        socket.addEventListener('message', handleSocketConnection);

        return () => socket.removeEventListener('message', handleSocketConnection);
    }, [isSocketConnected, socket, handleSocketConnection]);

    const totalSize = formatBytes(data.total_size);

    return (
        <Tr>
            <Td>
                <Box>
                    {data.status === 'paused' && (
                        <FaPlay color="white" size="25px" onClick={resumeDownloadHandler} />
                    )}
                    {(data.status === 'started' || data.status === 'scheduled') && (
                        <AiOutlinePause color="white" size="25px" onClick={pauseDownloadHandler} />
                    )}
                </Box>
            </Td>
            <Td>
                <Text fontWeight={500} flex={1.5} color={'gray.300'} size="sm">
                    {data.file_name}
                </Text>
            </Td>
            <Td>
                {data.status === 'started' ? (
                    <Progress
                        flex={1.5}
                        size="xs"
                        value={(data.downloaded / data.total_size) * 100}
                    />
                ) : (
                    data.status
                )}
            </Td>
            <Td>
                {data.status === 'started' && (
                    <Text fontWeight={600} flex={1} color={'gray.300'} size="sm" pr={5}>
                        {data.speed ? `${formatBytes(data.speed)}/ sec` : '--'}
                    </Text>
                )}
            </Td>
            <Td>
                {data.status === 'started' ? (
                    <Text fontWeight={600} flex={1} color={'gray.300'} size="sm" pr={5}>
                        {`${!data.downloaded ? '--' : formatBytes(data.downloaded)} / ${totalSize}`}
                    </Text>
                ) : (
                    <Text fontWeight={600} flex={1} color={'gray.300'} size="sm" pr={5}>
                        {totalSize}
                    </Text>
                )}
            </Td>
            <Td>
                <Box>
                    <AiOutlineClose color="white" size="20px" onClick={cancelDownload} />
                </Box>
            </Td>
        </Tr>
    );
}
