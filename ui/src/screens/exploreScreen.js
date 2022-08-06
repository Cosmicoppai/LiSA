import {
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Select } from "@chakra-ui/react";
import { AiFillFilter } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { getExploreDetails } from "../actions/animeActions";
import Card from "../components/card";

const ExploreScreen = () => {
  const [query, setQuery] = useState("airing");
  const { loading, details } = useSelector(
    (state) => state.animeExploreDetails
  );
  console.log(details);
  const filterChangeHandler = (e) => {
    setQuery(e.target.value);
  };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getExploreDetails(query));
  }, [query]);

  return (
    <Center py={6} w="100%">
      <Stack
        borderWidth="1px"
        borderRadius="lg"
        w={{ sm: "100%", md: "90%" }}
        direction={"column"}
        bg={"gray.900"}
        boxShadow={"2xl"}
        padding={4}
      >
        <Flex justifyContent={"space-between"} w={"100%"}>
          <Heading fontSize={"2xl"} fontFamily={"body"}>
            Explore
          </Heading>
          <Spacer />
          <Select
            onChange={filterChangeHandler}
            placeholder="Select option"
            maxWidth={"150px"}
            icon={<AiFillFilter />}
            value={query}
          >
            <option value="airing">Airing</option>
            <option value="upcoming">Upcoming</option>
            <option value="by_popularity">By Popularity</option>
            <option value="movie">Movie</option>

            <option value="tv">TV</option>
          </Select>
        </Flex>

        <Flex gap={6} flexWrap="wrap">
          {details &&
            details?.data?.map((anime) => {
              return <Card data={anime} />;
            })}
        </Flex>
      </Stack>
    </Center>
  );
};

export default ExploreScreen;
