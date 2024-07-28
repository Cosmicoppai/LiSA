import { Box, Icon, Progress, Tooltip } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { FaPlay } from 'react-icons/fa';
import { IoMdPause } from 'react-icons/io';
import { useSocketContext } from 'src/context/socket';
import { formatBytes } from 'src/utils/formatBytes';

import { TDownloadItem, TSocketEventDownloading, useDownloadingActions } from './useGetDownloads';

export function DownloadItem({ data: fetchedData }) {
    const { cancelDownload, pauseDownload, resumeDownload } = useDownloadingActions([
        fetchedData.id,
    ]);

    const [data, setSocketData] = useState<TDownloadItem>(fetchedData);
    const { socket, isSocketConnected } = useSocketContext();

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

    const handleSocketConnection = useCallback(
        (ev: MessageEvent<any>) => {
            const msg: TSocketEventDownloading =
                typeof ev?.data === 'string' ? JSON.parse(ev?.data) : null;

            if (msg?.type === 'downloads' && msg.data.id === fetchedData.id) {
                setSocketData({
                    ...fetchedData,
                    ...msg.data,
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
        <section
            style={{
                width: '100%',
                display: 'flex',
                columnGap: 20,
                alignItems: 'center',
            }}>
            <Tooltip label={data.status === 'paused' ? 'Resume' : 'Pause'} placement="top">
                <Box
                    style={{
                        cursor: 'pointer',
                        borderWidth: 1,
                        borderColor: 'white',
                        borderRadius: 20,
                        padding: 16,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={
                        data.status === 'paused' ? resumeDownloadHandler : pauseDownloadHandler
                    }>
                    <Icon as={data.status === 'paused' ? FaPlay : IoMdPause} w={6} h={6} />
                </Box>
            </Tooltip>
            <div
                style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: 6,
                }}>
                <div
                    style={{
                        flexGrow: 1,
                        flexShrink: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                    <span>{data.file_name}</span>
                    {import.meta.env.DEV && data.status !== 'started' ? (
                        <span
                            style={{
                                color: '#999',
                                fontSize: 14,
                            }}>
                            {data.status}
                        </span>
                    ) : null}
                </div>
                {data.status === 'started' ? (
                    <div
                        style={{
                            flexGrow: 1,
                            flexShrink: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            columnGap: 20,
                        }}>
                        <Progress
                            flex={1.5}
                            size="xs"
                            isIndeterminate={!data.downloaded}
                            value={(data.downloaded / data.total_size) * 100}
                        />
                    </div>
                ) : null}
                <div
                    style={{
                        flexGrow: 1,
                        flexShrink: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        columnGap: 20,
                    }}>
                    <span
                        style={{
                            color: '#999',
                            fontSize: 14,
                        }}>
                        {data.status === 'started' ? (
                            <>
                                {data.downloaded
                                    ? `${formatBytes(data.downloaded)} / ${totalSize}`
                                    : '--'}
                            </>
                        ) : (
                            <>{totalSize}</>
                        )}
                    </span>
                    <span
                        style={{
                            color: '#999',
                            fontSize: 14,
                        }}>
                        {data.speed ? `${formatBytes(data.speed)} / sec` : null}
                    </span>
                </div>
            </div>
            <Tooltip label={'Cancel'} placement="top">
                <Box
                    onClick={cancelDownload}
                    sx={{
                        cursor: 'pointer',
                    }}>
                    <AiOutlineClose size={28} />
                </Box>
            </Tooltip>
        </section>
    );
}
