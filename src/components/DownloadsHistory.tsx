import { Box, Flex, Heading, Icon, Stack, Text, Tooltip, useDisclosure } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { FaPlay } from 'react-icons/fa';
import { TbMoodSad } from 'react-icons/tb';
import { openFileExplorer } from 'src/utils/fn';
import { timeHourMin } from 'src/utils/time';

import { ExternalPlayerPopup } from './externalPopup';
import { TDownload, useGetDownloads } from './useGetDownloads';
import { formatBytes } from '../utils/formatBytes';

export function DownloadsHistory() {
    const { data } = useGetDownloads();

    const downloadedList = useMemo(() => {
        const library = data?.length ? data : [];

        return library.filter((i) => i.status === 'downloaded');
    }, [data]);

    const [playId, setPlayId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const playClickHandler = async (id) => {
        setPlayId(id);
        onOpen();
    };

    return (
        <Stack flex={1} flexDirection="column">
            <Heading fontSize={'xl'} py={2} fontFamily={'body'}>
                History
            </Heading>
            <Stack
                flex={1}
                flexDirection="column"
                alignItems="flex-start"
                p={1}
                pt={2}
                bg={'gray.900'}
                minWidth={'400px'}>
                {downloadedList.length ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            rowGap: 20,
                        }}>
                        {downloadedList.map((item, index: number) => (
                            <DownloadsHistoryItem
                                key={index}
                                data={item}
                                playClickHandler={playClickHandler}
                            />
                        ))}
                    </div>
                ) : (
                    <DownloadsHistoryEmpty />
                )}
            </Stack>
            {/* @ts-ignore */}
            <ExternalPlayerPopup
                isOpen={isOpen}
                onClose={onClose}
                playId={playId}
                historyPlay={true}
            />
        </Stack>
    );
}

function DownloadsHistoryItem({
    data,
    playClickHandler,
}: {
    data: TDownload;
    playClickHandler: (id: TDownload['id']) => void;
}) {
    return (
        <section
            style={{
                width: '100%',
                display: 'flex',
                columnGap: 20,
                alignItems: 'center',
            }}>
            <Tooltip label={'Play'} placement="top">
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
                    onClick={() => playClickHandler(data.id)}>
                    <Icon as={FaPlay} w={6} h={6} />
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
                    <strong>{data.file_name}</strong>
                    <span
                        style={{
                            color: '#999',
                            fontSize: 14,
                        }}>
                        {timeHourMin(data.created_on)}
                    </span>
                </div>
                <div
                    style={{
                        flexGrow: 1,
                        flexShrink: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                    <span
                        style={{
                            color: '#999',
                            fontSize: 14,
                        }}>
                        {formatBytes(data.total_size)}
                    </span>
                    <Tooltip label={'Show file in folder'} placement="bottom-end">
                        <Box
                            onClick={() => openFileExplorer(data.file_location)}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <AiOutlineFolderOpen size={22} />
                        </Box>
                    </Tooltip>
                </div>
            </div>
        </section>
    );
}

function DownloadsHistoryEmpty() {
    return (
        <Flex alignItems={'center'} justifyContent="center" p={3} width={'100%'}>
            <Box color="gray.500" marginInline="2">
                <TbMoodSad size={24} />
            </Box>
            <Text fontWeight={600} color={'gray.500'} size="lg" textAlign={'center'}>
                No Previous Downloads
            </Text>
        </Flex>
    );
}
