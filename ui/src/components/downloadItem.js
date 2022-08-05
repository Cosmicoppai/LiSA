import { Flex,  Progress, Text } from "@chakra-ui/react";
import React from "react";
import { formatBytes } from "../utils";

const DownloadItem = ({ file_name, data }) => {
  console.log(data);
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

      <Flex gap={6} alignItems={"center"} justifyContent={"center"}  pr={5} flex={1}>
        <Text fontWeight={600} flex={1} color={"gray.300"} size="sm" pr={5}>
          {data.speed ? `${formatBytes(data.speed)}/ sec`: 0}
        </Text>
        <Text fontWeight={600} flex={1} color={"gray.300"} size="sm"  pr={5}>
          {formatBytes(data.file_size)}
        </Text>
      </Flex>
    </Flex>
  );
};

export default DownloadItem;
