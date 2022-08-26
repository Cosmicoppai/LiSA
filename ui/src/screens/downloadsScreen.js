import { Box, Center, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { getDownloadHistory } from "../actions/animeActions";
import DownloadItem from "../components/downloadItem";
import { useSelector, useDispatch } from "react-redux";
import { TbMoodSad } from "react-icons/tb";
import { FaPlay } from "react-icons/fa";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { formatBytes } from "../utils";

var W3CWebSocket = require("websocket").w3cwebsocket;

let openFileExplorer;
// if (typeof window !== "undefined") {
//   const { shell } = window.require("electron");
//   openFileExplorer = (file_location) => {
//     // Show a folder in the file manager
//     // Or a file
//     shell.showItemInFolder(file_location);
//   };
// } else {
//   openFileExplorer = (file_location) => {
//     // Show a folder in the file manager
//     // Or a file
//     // shell.showItemInFolder(file_location);
//   };
// }

const DownloadScreen = () => {
  const dispatch = useDispatch();
  const [filesStatus, setFilesStatus] = useState({});
  const historyDetails = useSelector((state) => state.animeDownloadDetails);

  useEffect(() => {
    const client = new W3CWebSocket("ws://localhost:9000");

    console.log("runnnn");
    dispatch(getDownloadHistory());

    client.onopen = () => {
      console.log("WebSocket Client Connected");
      client.send(JSON.stringify({ type: "connect" }));
    };
    client.onmessage = (message) => {
      let packet = JSON.parse(message.data);
      let { data, type } = packet;

      // console.log("packet", packet);

      if (type === "new_file") {
        setFilesStatus((prev) => {
          return { ...prev, ...data };
        });
      }
      if (type === "file_update") {
        setFilesStatus((prev) => {
          if (
            Object.values(data)[0].file_size ===
            Object.values(data)[0].downloaded
          ) {
            console.log("completed");
            let temp = prev;
            temp = delete temp[Object.keys(data)[0]];
            dispatch(getDownloadHistory());

            return temp;
          } else {
            return { ...prev, ...data };
          }
        });
      }
      if (type === "all_files_status") {
        setFilesStatus(data);
      }
    };
  }, []);

  console.log(Object.entries(filesStatus));

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
            minWidth={"400px"}
          >
            <Box sx={{ width: "100%", p: 3 }}>
              {Object.entries(filesStatus).length === 0 ? (
                <Flex alignItems={"center"} justifyContent="center">
                  <Text
                    fontWeight={600}
                    color={"gray.500"}
                    size="lg"
                    textAlign={"center"}
                  >
                    No Active Download
                  </Text>

                  <Box color="gray.500" ml="2">
                    <TbMoodSad size={24} />
                  </Box>
                </Flex>
              ) : (
                <Flex
                  pt={1}
                  px={1}
                  gap={6}
                  alignItems={"center"}
                  justifyContent={"center"}
                  mb={4}
                >
                  <Text fontWeight={600} flex={1.5} color={"gray.400"}>
                    Name
                  </Text>

                  <Text flex={1.5} fontWeight={600} color={"gray.400"}>
                    Status
                  </Text>

                  <Flex
                    gap={6}
                    alignItems={"center"}
                    justifyContent={"center"}
                    flex={1}
                  >
                    <Text
                      fontWeight={600}
                      flex={1}
                      color={"gray.400"}
                      size="sm"
                    >
                      Speed
                    </Text>
                    <Text
                      fontWeight={600}
                      flex={1}
                      color={"gray.400"}
                      size="sm"
                    >
                      Size
                    </Text>
                  </Flex>
                </Flex>
              )}

              {Object.entries(filesStatus).map(([key, value]) => {
                console.log(key, value);
                return <DownloadItem file_name={key} data={value} key={key} />;
              })}
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
            minWidth={"400px"}
          >
            {historyDetails?.details &&
            historyDetails?.details?.length !== 0 ? (
              historyDetails.details.map((history_item, idx) => {
                return (
                  <Flex
                    key={idx}
                    pt={1}
                    p={3}
                    width={"100%"}
                    flex={1}
                    gap={6}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    mb={4}
                  >
                    <Box sx={{ cursor: "pointer" }}>
                      <FaPlay
                        onClick={() => openFileExplorer(history_item.location)}
                      />
                    </Box>
                    <Text
                      fontWeight={500}
                      flex={1.5}
                      color={"gray.300"}
                      size="sm"
                    >
                      {history_item.file_name}
                    </Text>

                    <Flex gap={3}>
                      <Text
                        fontWeight={300}
                        flex={1.5}
                        color={"gray.200"}
                        size="sm"
                      >
                        Completed
                      </Text>
                      <Text
                        fontWeight={500}
                        flex={1.5}
                        color={"gray.300"}
                        size="sm"
                      >
                        {formatBytes(history_item.total_size)}
                      </Text>
                      {/* <Text
                          fontWeight={500}
                          flex={1.5}
                          color={"gray.300"}
                          size="sm"
                        >
                          {history_item.created_on}
                        </Text> */}
                    </Flex>
                    <Box
                      onClick={() => openFileExplorer(history_item.location)}
                      sx={{ cursor: "pointer" }}
                    >
                      <AiOutlineFolderOpen size={22} />
                    </Box>
                  </Flex>
                );
              })
            ) : (
              <Flex
                alignItems={"center"}
                justifyContent="center"
                p={3}
                pt={2}
                width={"100%"}
              >
                <Text
                  fontWeight={600}
                  color={"gray.500"}
                  size="lg"
                  textAlign={"center"}
                >
                  No Previous Downloads
                </Text>

                <Box color="gray.500" ml="2">
                  <TbMoodSad size={24} />
                </Box>
              </Flex>
            )}
          </Stack>{" "}
        </Stack>
      </Stack>
    </Center>
  );
};

export default DownloadScreen;
