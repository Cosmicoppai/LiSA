import {
    Box,
    Button,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { BsDot } from 'react-icons/bs';
import { FaPlay } from 'react-icons/fa';
import { MdVideoLibrary } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { openFileExplorer } from 'src/utils/fn';
import { timeHourMin } from 'src/utils/time';

import { TDownload, TDownloadAnimeEpisode } from '../hooks/useGetDownloads';
import { formatBytes } from '../utils/formatBytes';
import { getVideoDuration, getVideoThumbnail } from '../utils/video-metadata';

export function DownloadsHistoryAnimeItem({ item }: { item: TDownload }) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const btnRef = useRef(null);

    return (
        <>
            <Box
                ref={btnRef}
                onClick={onOpen}
                style={{
                    width: '100%',
                    display: 'flex',
                    columnGap: 20,
                    cursor: 'pointer',
                    padding: 10,
                    borderRadius: 10,
                }}
                _hover={{
                    backgroundColor: '#00000033',
                }}>
                <MdVideoLibrary size={48} />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        columnGap: 10,
                    }}>
                    <Text
                        noOfLines={1}
                        style={{
                            fontWeight: 'bold',
                            fontSize: 20,
                        }}>
                        {item.title}
                    </Text>
                    <span
                        style={{
                            fontSize: 12,
                        }}>
                        {item.episodes?.length} Videos
                    </span>
                </div>
            </Box>

            <Modal
                onClose={onClose}
                finalFocusRef={btnRef}
                isOpen={isOpen}
                isCentered
                size={'3xl'}
                scrollBehavior={'inside'}
                motionPreset="slideInBottom">
                <ModalOverlay />
                <ModalContent bg={'gray.800'}>
                    <ModalHeader>{item.title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody className="custom-scrollbar">
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                rowGap: 20,
                            }}>
                            {item.episodes?.map((i) => (
                                <DownloadsHistoryAnimeEpItem key={i.id} data={i} />
                            ))}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

function DownloadsHistoryAnimeEpItem({ data }: { data: TDownloadAnimeEpisode }) {
    const navigate = useNavigate();

    function playClickHandler() {
        navigate(
            `/local-player?${new URLSearchParams({
                q: JSON.stringify(data),
            })}`,
        );
    }

    const [thumbnail, setThumbnail] = useState(null);
    const [vidDuration, setVidDuration] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const thumb = await getVideoThumbnail(`file:///${data.file_location}`, 8);
                if (thumb) setThumbnail(thumb);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [data.file_location]);

    useEffect(() => {
        (async () => {
            try {
                const duration = await getVideoDuration(`file:///${data.file_location}`);
                if (duration) setVidDuration(duration);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [data.file_location]);

    return (
        <Box
            style={{
                width: '100%',
                display: 'flex',
                columnGap: 20,
                cursor: 'pointer',
                padding: 10,
                borderRadius: 10,
            }}
            _hover={{
                backgroundColor: '#00000033',
            }}
            onClick={playClickHandler}>
            <Tooltip label={'Play'} placement="bottom">
                {thumbnail ? (
                    <div style={{ position: 'relative' }}>
                        <img
                            src={thumbnail}
                            alt="Video Thumbnail"
                            width={100}
                            height={100}
                            style={{
                                borderRadius: 10,
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                left: 10,
                                bottom: 10,
                            }}>
                            <FaPlay />
                        </div>
                    </div>
                ) : (
                    <Box
                        style={{
                            maxWidth: 80,
                            maxHeight: 80,
                            minWidth: 80,
                            minHeight: 80,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: 'white',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Icon as={FaPlay} width={6} h={6} />
                    </Box>
                )}
            </Tooltip>
            <div
                style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: 6,
                }}>
                <strong>{data.file_name}</strong>
                {vidDuration ? (
                    <span
                        style={{
                            fontSize: 14,
                        }}>
                        {Math.floor(vidDuration / 60)}m
                    </span>
                ) : null}
                <div
                    style={{
                        flexGrow: 1,
                        flexShrink: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#999',
                        }}>
                        <span
                            style={{
                                fontSize: 14,
                            }}>
                            {formatBytes(data.total_size)}
                        </span>
                        <BsDot />
                        <span
                            style={{
                                color: '#999',
                                fontSize: 14,
                            }}>
                            {timeHourMin(data.created_on)}
                        </span>
                    </div>
                    <Tooltip label={'Show file in folder'} placement="bottom-end">
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                openFileExplorer(data.file_location);
                            }}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <AiOutlineFolderOpen size={22} />
                        </Box>
                    </Tooltip>
                </div>
            </div>
        </Box>
    );
}
