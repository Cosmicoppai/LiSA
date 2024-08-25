import {
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Icon,
    Tooltip,
} from '@chakra-ui/react';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { FaPlay } from 'react-icons/fa';
import { MdVideoLibrary } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { openFileExplorer } from 'src/utils/fn';
import { timeHourMin } from 'src/utils/time';

import { TDownload, TDownloadMangaChapter } from '../hooks/useGetDownloads';
import { formatBytes } from '../utils/formatBytes';

export function DownloadsHistoryMangaItem({ item }: { item: TDownload }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                rowGap: 20,
            }}>
            <AccordionItem
                style={{
                    borderTopWidth: 0,
                }}>
                <AccordionButton>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                columnGap: 10,
                                alignItems: 'center',
                            }}>
                            <MdVideoLibrary size={28} />
                            <strong>{item.title}</strong>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                columnGap: 10,
                                alignItems: 'center',
                            }}>
                            <span
                                style={{
                                    fontSize: 12,
                                }}>
                                {item.chapters?.length} Chapters
                            </span>
                            <AccordionIcon />
                        </div>
                    </div>
                </AccordionButton>
                <AccordionPanel pb={4}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            rowGap: 20,
                        }}>
                        {item.chapters?.map((i) => (
                            <DownloadsHistoryAnimeEpItem key={i.id} data={i} mangaDetails={item} />
                        ))}
                    </div>
                </AccordionPanel>
            </AccordionItem>
        </div>
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
                        padding: 14,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={playClickHandler}>
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
                    <span>{data.file_name}</span>
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
                            onClick={() => openFileExplorer(filePath)}
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
