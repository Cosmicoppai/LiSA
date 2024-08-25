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
import { useRef } from 'react';
import { AiOutlineFolderOpen, AiFillRead } from 'react-icons/ai';
import { BiSolidBook } from 'react-icons/bi';
import { BsDot } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { openFileExplorer } from 'src/utils/fn';

import { TDownload, TDownloadMangaChapter } from '../hooks/useGetDownloads';
import { formatBytes } from '../utils/formatBytes';
import { timeHourMin } from '../utils/time';

export function DownloadsHistoryMangaItem({ item }: { item: TDownload }) {
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
                <BiSolidBook size={48} />
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
                        {item.chapters?.length} Chapters
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
                            {item.chapters?.map((i) => (
                                <DownloadsHistoryAnimeEpItem
                                    key={i.id}
                                    data={i}
                                    mangaDetails={item}
                                />
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

function DownloadsHistoryAnimeEpItem({
    data,
    mangaDetails,
}: {
    data: TDownloadMangaChapter;
    mangaDetails: TDownload;
}) {
    const navigate = useNavigate();

    function playClickHandler() {
        navigate(
            `/local-manga-reader?${new URLSearchParams({
                q: JSON.stringify(mangaDetails),
                chapter_id: String(data.id),
            })}`,
        );
    }

    const filePath = Array.isArray(data.file_location) ? data.file_location[0] : data.file_location;

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
            <Tooltip label={'Read'} placement="top">
                <Box
                    style={{
                        cursor: 'pointer',
                        borderWidth: 1,
                        borderColor: 'white',
                        borderRadius: 20,
                        padding: 14,
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                    <Icon as={AiFillRead} w={6} h={6} />
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
                <strong>{data.file_name}</strong>
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
                                openFileExplorer(filePath);
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
