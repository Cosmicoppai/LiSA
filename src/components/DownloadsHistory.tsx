import {
    Box, Flex,
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
    useDisclosure
} from "@chakra-ui/react";
import { TbMoodSad } from "react-icons/tb";
import { FaPlay } from "react-icons/fa";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { formatBytes } from "../utils/formatBytes";
import ExternalPlayerPopup from "./externalPopup";
import { useState } from "react";
import { openFileExplorer } from "src/utils/fn";

export function DownloadsHistory({
    historyDetails
}) {

    const [playId, setPlayId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const playClickHandler = async (id) => {
        setPlayId(id);
        onOpen();
    };

    return (
        <Stack flex={1} flexDirection="column" pt={2}>
            <Heading fontSize={"xl"} fontFamily={"body"}>
                History
            </Heading>
            <Stack flex={1} flexDirection="column" alignItems="flex-start" p={1} pt={2} bg={"gray.900"} minWidth={"400px"}>
                {historyDetails?.details?.length !== 0 ? <>{historyDetails?.details?.map((history_item, index: number) => history_item.status === "downloaded" ? <TableContainer key={index} width={"100%"}>
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
                            <Tr>
                                <Td>
                                    <Box sx={{
                                        cursor: "pointer"
                                    }} onClick={() => playClickHandler(history_item.id)}>
                                        <FaPlay onClick={() => openFileExplorer(history_item.file_location)} />
                                    </Box>
                                </Td>
                                <Td> {history_item.file_name}</Td>
                                <Td> {history_item.status}</Td>
                                <Td>

                                    {formatBytes(history_item.total_size)}
                                </Td>
                                <Td> {history_item.created_on}</Td>
                                <Td maxWidth={"50px"}>

                                    <Box onClick={() => openFileExplorer(history_item.file_location)} sx={{
                                        cursor: "pointer"
                                    }}>
                                        <AiOutlineFolderOpen size={22} />
                                    </Box>
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer> : null)}</> : <Flex alignItems={"center"} justifyContent="center" p={3} pt={2} width={"100%"}>
                    <Box color="gray.500" marginInline="2">
                        <TbMoodSad size={24} />
                    </Box>
                    <Text fontWeight={600} color={"gray.500"} size="lg" textAlign={"center"}>
                        No Previous Downloads
                    </Text>
                </Flex>}
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
