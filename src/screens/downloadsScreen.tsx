import {
    Box,
    Center,
    Flex,
    Heading,
    Stack,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect, useContext } from "react";

import { useSelector, useDispatch } from "react-redux";
import { TbMoodSad } from "react-icons/tb";
import { FaPlay } from "react-icons/fa";
import { AiOutlineFolderOpen } from "react-icons/ai";

import {
    cancelLiveDownload,
    getDownloadHistory,
    pauseLiveDownload,
    resumeLiveDownload,
} from "../store/actions/animeActions";

import { formatBytes } from "../utils";
import { SocketContext } from "../socket";
import DownloadList from "../components/downloadList";
import ExternalPlayerPopup from "../components/externalPopup";

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
const { shell } = window.require("electron");

let openFileExplorer = (file_location) => {
    // Show a folder in the file manager
    // Or a file
    console.log(file_location);

    shell.showItemInFolder(file_location);
};

const DownloadScreen = () => {
    const dispatch = useDispatch();
    const [filesStatus, setFilesStatus] = useState({});
    const [test, setTest] = useState({});
    const [connected, setConnected] = useState(false);
    const [playId, setPlayId] = useState(null);
    const historyDetails = useSelector((state) => state.animeLibraryDetails);
    const client = useContext(SocketContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        dispatch(getDownloadHistory());
        if (!client) return;
        // client.onopen = () => {
        //   console.log("WebSocket Client Connected");
        //   client.send(JSON.stringify({ type: "connect" }));
        //   setConnected(true);
        //   setConnected(true);
        // };

        return () => {
            setConnected(false);
        };
    }, [client]);

    const onMessageListner = () => {
        client.onmessage = (message) => {
            let packet = JSON.parse(message.data);
            let { data } = packet;

            let tempData = data;
            setTest(data);

            setFilesStatus((prev) => {
                let temp = filesStatus;

                if (tempData.downloaded === tempData.total_size && tempData.total_size > 0) {
                    if (!filesStatus) return {};
                    const { [tempData.id]: removedProperty, ...restObject } = filesStatus;

                    // sleep(5000);

                    dispatch(getDownloadHistory());

                    return restObject;
                } else {
                    temp[tempData.id] = tempData;
                    let sec = {};
                    if (historyDetails?.details) {
                        historyDetails?.details?.forEach((history_item) => {
                            if (history_item.status !== "downloaded")
                                sec[history_item.id] = history_item;
                        });
                        return { ...sec, ...temp };
                    } else {
                        return filesStatus;
                    }
                }

                // console.log(temp);
            });

            // if (tempData.downloaded === tempData.total_size) {
            //   console.time()

            //   console.time()

            // }
        };
    };

    useEffect(() => {
        setFilesStatus(() => {
            let sec = {};
            historyDetails?.details?.forEach((history_item) => {
                if (history_item.status !== "downloaded") {
                    sec[history_item.id] = history_item;
                }
            });
            return { ...filesStatus, ...sec };
        });
    }, [historyDetails]);

    useEffect(() => {
        if (!client) return;
        onMessageListner();
    }, [filesStatus]);

    const playClickHandler = async (id) => {
        setPlayId(id);
        onOpen();
    };

    const cancelDownloadHandler = (id) => {
        cancelLiveDownload(id);

        setFilesStatus((prev) => {
            try {
                if (!filesStatus) return {};
                const { [id]: removedProperty, ...restObject } = filesStatus;

                return restObject;
            } catch (error) {
                console.log(error);
            }
        });
    };
    const pauseDownloadHandler = (id) => {
        pauseLiveDownload(id);
        // sleep(5000);
        dispatch(getDownloadHistory());
    };
    const resumeDownloadHandler = (id) => {
        resumeLiveDownload(id);
    };

    return (
        <Center py={6} w="100%">
            <Stack flex={1} flexDirection="column" p={1} pt={2} maxWidth={"90%"}>
                {" "}
                <Stack flex={1} flexDirection="column">
                    <Heading fontSize={"xl"} fontFamily={"body"}>
                        Active Downloads
                    </Heading>

                    <Stack
                        flex={1}
                        flexDirection="column"
                        alignItems="flex-start"
                        p={1}
                        pt={2}
                        bg={"gray.900"}
                        minWidth={"400px"}>
                        <Box sx={{ width: "100%", p: 3 }}>
                            {filesStatus && Object.entries(filesStatus).length === 0 ? (
                                <Flex alignItems={"center"} justifyContent="center">
                                    <Text
                                        fontWeight={600}
                                        color={"gray.500"}
                                        size="lg"
                                        textAlign={"center"}>
                                        No Active Download
                                    </Text>

                                    <Box color="gray.500" ml="2">
                                        <TbMoodSad size={24} />
                                    </Box>
                                </Flex>
                            ) : (
                                <TableContainer width={"100%"}>
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Th></Th>
                                                <Th fontSize={"16px"}>FILE NAME</Th>
                                                <Th fontSize={"16px"}>STATUS</Th>
                                                <Th fontSize={"16px"}>SPEED</Th>
                                                <Th fontSize={"16px"}>SIZE</Th>
                                                <Th></Th>
                                            </Tr>
                                        </Thead>
                                        <DownloadList
                                            filesStatus={filesStatus}
                                            cancelDownloadHandler={cancelDownloadHandler}
                                            pauseDownloadHandler={pauseDownloadHandler}
                                            resumeDownloadHandler={resumeDownloadHandler}
                                        />
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Stack>
                </Stack>
                <Stack flex={1} flexDirection="column" pt={2}>
                    <Heading fontSize={"xl"} fontFamily={"body"}>
                        History
                    </Heading>
                    <Stack
                        flex={1}
                        flexDirection="column"
                        alignItems="flex-start"
                        p={1}
                        pt={2}
                        bg={"gray.900"}
                        minWidth={"400px"}>
                        <TableContainer width={"100%"}>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th></Th>
                                        <Th fontSize={"16px"}>FILE NAME</Th>
                                        <Th fontSize={"16px"}>STATUS</Th>
                                        <Th fontSize={"16px"}>TOTAL SIZE</Th>
                                        <Th fontSize={"16px"}>CREATED ON</Th>
                                        <Th></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {historyDetails?.details &&
                                        historyDetails?.details?.length !== 0 ? (
                                        historyDetails.details.map((history_item, idx) => {
                                            if (history_item.status === "downloaded") {
                                                return (
                                                    <Tr>
                                                        <Td>
                                                            {" "}
                                                            <Box
                                                                sx={{ cursor: "pointer" }}
                                                                onClick={() =>
                                                                    playClickHandler(
                                                                        history_item.id
                                                                    )
                                                                }>
                                                                <FaPlay
                                                                    onClick={() =>
                                                                        openFileExplorer(
                                                                            history_item.file_location
                                                                        )
                                                                    }
                                                                />
                                                            </Box>
                                                        </Td>
                                                        <Td> {history_item.file_name}</Td>
                                                        <Td> {history_item.status}</Td>
                                                        <Td>
                                                            {" "}
                                                            {formatBytes(history_item.total_size)}
                                                        </Td>
                                                        <Td> {history_item.created_on}</Td>
                                                        <Td maxWidth={"50px"}>
                                                            {" "}
                                                            <Box
                                                                onClick={() =>
                                                                    openFileExplorer(
                                                                        history_item.file_location
                                                                    )
                                                                }
                                                                sx={{ cursor: "pointer" }}>
                                                                <AiOutlineFolderOpen size={22} />
                                                            </Box>
                                                        </Td>
                                                    </Tr>
                                                );
                                            } else {
                                                return null;
                                            }
                                        })
                                    ) : (
                                        <Flex
                                            alignItems={"center"}
                                            justifyContent="center"
                                            p={3}
                                            pt={2}
                                            width={"100%"}>
                                            <Text
                                                fontWeight={600}
                                                color={"gray.500"}
                                                size="lg"
                                                textAlign={"center"}>
                                                No Previous Downloads
                                            </Text>

                                            <Box color="gray.500" ml="2">
                                                <TbMoodSad size={24} />
                                            </Box>
                                        </Flex>
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </Stack>
            </Stack>

            <ExternalPlayerPopup
                isOpen={isOpen}
                onClose={onClose}
                playId={playId}
                historyPlay={true}
            />
        </Center>
    );
};

export default DownloadScreen;
