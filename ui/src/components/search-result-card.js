import React from "react";
import {
  Badge,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const SearchResultCard = ({ data }) => {
  return (
    <Center py={6} w="100%" h="100%">
      <Stack
        borderWidth="1px"
        borderRadius="lg"
        w={{ sm: "100%", md: "50%" }}
        height={{ sm: "476px", md: "100%" }}
        maxH="20rem"
        direction={{ base: "column", md: "row" }}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"2xl"}
        padding={4}
      >
        <Flex flex={1} bg="blue.200">
          <Link
            to="anime-details"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <Image objectFit="contain" boxSize="100%" src={data.poster} />
          </Link>
        </Flex>
        <Stack
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          p={1}
          pt={2}
        >
          <Link
            to="anime-details"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              {`${data.eng_name}`}
              {data.jp_name ? ` | ${data.jp_name}` : ""}
            </Heading>
          </Link>

          <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
            No of episodes {data.no_of_episodes}
          </Text>

          <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue("gray.50", "gray.800")}
              fontWeight={"400"}
            >
              {data.description.Type}
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue("gray.50", "gray.800")}
              fontWeight={"400"}
            >
              {data.description.Aired}
            </Badge>
          </Stack>
        </Stack>
      </Stack>
    </Center>
  );
};

export default SearchResultCard;
