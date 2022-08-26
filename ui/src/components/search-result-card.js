import React from "react";
import {
  Badge,
  Box,
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
import { addAnimeDetails } from "../actions/animeActions";
import { useDispatch } from "react-redux";
import { AiFillStar } from 'react-icons/ai';

const SearchResultCard = ({ data }) => {
  const dispatch = useDispatch();

  const detailsClickHandler = () => {
    dispatch(addAnimeDetails(data));
  };

  return (
    <Link
      to="anime-details"
      style={{
        textDecoration: "none",
        maxWidth: "600px",
        width: "45%",
        display: "flex",
        justifyContent: "center",
      }}
      onClick={detailsClickHandler}
    >
      <Stack
        mt={5}
        borderWidth="1px"
        borderRadius="lg"
        w={{ sm: "100%", md: "100%" }}
        // height={{ sm: "200px", md: "2000px" }}
        // maxH="200px"
        // direction={{ base: "column", md: "row" }}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"2xl"}
        padding={1}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Flex width={"100%"} height="100%">
          <Link
            to="anime-details"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <Image
              objectFit="contain"
              boxSize="90%"
              src={data.poster}
              // maxWidth="150px"
            />
          </Link>
        </Flex>
        <Stack
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          p={1}
        >
          <Heading fontSize={"l"} fontFamily={"body"}>
            {data.jp_name ? `${data.jp_name}` : ""}
            {data.eng_name ? ` | ${data.eng_name}` : ""}
          </Heading>

          <Text fontWeight={600} color={"gray.500"} size="sm" mb={1}>
            No of episodes {data.no_of_episodes}
          </Text>

          <Box display={"flex"} alignItems="center" justifyContent={"center"}>
            <AiFillStar color="#FDCC0D" />
            <Text ml={"5px"}>

            {data.score}
            </Text>
          </Box>

          <Stack align={"center"} justify={"center"} direction={"row"}>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue("gray.50", "gray.800")}
              fontWeight={"400"}
            >
              {data.type}
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue("gray.50", "gray.800")}
              fontWeight={"400"}
            >
              {data.status}
            </Badge>
          </Stack>
        </Stack>
      </Stack>
    </Link>
  );
};

export default SearchResultCard;
