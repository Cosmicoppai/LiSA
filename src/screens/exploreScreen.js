import {
  Box,
  Center,
  Flex,
  Heading,
  Skeleton,
  Spacer,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Select } from "@chakra-ui/react";
import { AiFillFilter } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { getExploreDetails } from "../actions/animeActions";
import Card from "../components/card";
// import { useNavigate } from "react-router-dom";

const ExploreScreen = () => {
  const [query, setQuery] = useState("airing");
  const { loading, details } = useSelector((state) => {
    return state.animeExploreDetails;
  });
  const filterChangeHandler = (e) => {
    setQuery(e.target.value);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (window) {
      window?.scrollTo(0, 0);
    }
  }, []);

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
            maxWidth={"150px"}
            icon={<AiFillFilter />}
            value={query}
          >
            <option value="all_anime">All</option>
            <option value="tv">TV</option>
            <option value="movie">Movie</option>
            <option value="airing">Airing</option>
            <option value="upcoming">Upcoming</option>
            <option value="by_popularity">By Popularity</option>
            <option value="ova">OVA</option>
            <option value="ona">ONA</option>
            <option value="special">Special</option>
            <option value="favorite">Favorite</option>
          </Select>
        </Flex>

        <div style={{ maxWidth: "1200px", margin: " 0 auto" }}></div>
        <ul
          style={{
            display: "flex",
            flexWrap: "wrap",
            listStyle: "none",
            margin: 0,
            padding: 0,
            marginTop: "20px",
          }}
        >
          {details
            ? details?.data?.map((anime) => {
                return <Card data={anime} query={query} />;
              })
            : Array(30)
                .fill(0)
                .map(() => (
                  <Skeleton
                    width={"300px"}
                    height={"450px"}
                    sx={{ padding: "1rem", margin: "10px auto" }}
                    padding={6}
                  />
                ))}
        </ul>

        <Flex gap={6} flexWrap="wrap"></Flex>
      </Stack>
    </Center>
  );
};

export default ExploreScreen;
