import { Box, Center, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import React, { useState, useContext, useCallback, useEffect } from "react";
import { w3cwebsocket } from "websocket";
import { getDownloadHistory } from "../actions/animeActions";
import DownloadItem from "../components/downloadItem";
import { useSelector, useDispatch } from "react-redux";

var W3CWebSocket = require("websocket").w3cwebsocket;

const client = new W3CWebSocket("ws://localhost:9000");

const DownloadScreen = () => {
  const dispatch = useDispatch();
  const [filesStatus, setFilesStatus] = useState({});
  const dddd = useSelector((state) => state.animeDownloadDetails);

  console.log(dddd);

  useEffect(() => {
    dispatch(getDownloadHistory());
  }, []);

  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
      client.send(JSON.stringify({ type: "connect" }));
    };
    client.onmessage = (message) => {
      let packet = JSON.parse(message.data);
      let { data, type } = packet;

      if (type === "new_file") {
        setFilesStatus((prev) => {
          return { ...prev, ...data };
        });
      }
      if (type === "file_update") {
        setFilesStatus((prev) => {
          if (data.file_size === data.downloaded) {
            let temp = delete prev[Object.keys(data)[0]];
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

                <Flex gap={6} alignItems={"center"} justifyContent={"center"}>
                  <Text
                    fontWeight={600}
                    flex={0.5}
                    color={"gray.400"}
                    size="sm"
                  >
                    Speed
                  </Text>
                  <Text
                    fontWeight={600}
                    flex={0.5}
                    color={"gray.400"}
                    size="sm"
                  >
                    Size
                  </Text>
                </Flex>
              </Flex>

              {Object.entries(filesStatus).map(([key, value]) => {
                console.log(key, value);
                return <DownloadItem file_name={key} data={value} key={key} />;
              })}
            </Box>
          </Stack>
        </Stack>
        <Stack flex={1} flexDirection="column" p={1} pt={2} maxWidth={"90%"}>
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
            <Box sx={{ width: "100%", p: 3 }}></Box>
          </Stack>{" "}
        </Stack>
      </Stack>
    </Center>
  );
};

export default DownloadScreen;
