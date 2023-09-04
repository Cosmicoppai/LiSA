import { Box, Flex, Progress, Td, Text, Tr } from "@chakra-ui/react";
import React from "react";
import { AiOutlineClose, AiOutlinePause } from "react-icons/ai";
import { FaPlay } from "react-icons/fa";
import { cancelLiveDownload } from "../store/actions/animeActions";
import { formatBytes } from "../utils";

const DownloadItem = ({
    key,
    data,
    cancelDownloadHandler,
    pauseDownloadHandler,
    resumeDownloadHandler,
}) => {
    return (
        <Tr>
            <Td>
                {" "}
                {data.status === "paused" && (
                    <Box>
                        <FaPlay
                            color="white"
                            size="25px"
                            onClick={() => resumeDownloadHandler(data.id)}
                        />
                    </Box>
                )}
                {(data.status === "started" || data.status === "scheduled") && (
                    <Box>
                        <AiOutlinePause
                            color="white"
                            size="25px"
                            onClick={() => pauseDownloadHandler(data.id)}
                        />
                    </Box>
                )}
            </Td>
            <Td>
                <Text fontWeight={500} flex={1.5} color={"gray.300"} size="sm">
                    {data.file_name}
                </Text>
            </Td>
            <Td>
                {" "}
                {data.status === "started" ? (
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
                {" "}
                {data.status === "started" && (
                    <Text fontWeight={600} flex={1} color={"gray.300"} size="sm" pr={5}>
                        {data.speed ? `${formatBytes(data.speed)}/ sec` : "--"}
                    </Text>
                )}
            </Td>
            <Td>
                {" "}
                {data.status === "started" ? (
                    <Text fontWeight={600} flex={1} color={"gray.300"} size="sm" pr={5}>
                        {!data.downloaded
                            ? `-- / ${formatBytes(data.total_size)}`
                            : `${formatBytes(data.downloaded)} / ${formatBytes(data.total_size)}`}
                    </Text>
                ) : (
                    <Text fontWeight={600} flex={1} color={"gray.300"} size="sm" pr={5}>
                        {formatBytes(data.total_size)}
                    </Text>
                )}
            </Td>
            <Td>
                {" "}
                <Box>
                    <AiOutlineClose
                        color="white"
                        size="20px"
                        onClick={() => cancelDownloadHandler(data.id)}
                    />
                </Box>
            </Td>
        </Tr>
    );
};

export default DownloadItem;
