import { Box, Flex, Heading, Progress, Text } from "@chakra-ui/react";
import React from "react";
import { formatBytes } from "../utils";

const DownloadItem = ({ file_name, data }) => {
  console.log(data)
  return (
    <Flex
      pt={1}
      px={1}
      gap={6}
      alignItems={"center"}
      justifyContent={"center"}
      mb={4}
    >
      <Text fontWeight={500} flex={1.5} color={"gray.300"} size="sm">
        {file_name}
      </Text>
      <Progress
        flex={1.5}
        size="xs"
        value={(data.downloaded / data.file_size) * 100}
      />

      <Flex gap={6} alignItems={"center"} justifyContent={"center"}>
        <Text fontWeight={600} flex={0.5} color={"gray.300"} size="sm">
          {data.speed ? data.speed : 0}
        </Text>
        <Text fontWeight={600} flex={0.5} color={"gray.300"} size="sm">
          {formatBytes(data.file_size)}
        </Text>
      </Flex>
    </Flex>
  );
};

export default DownloadItem;
