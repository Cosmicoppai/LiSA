import React from "react";
import "../App.css";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import {
  DownloadIcon,
  HamburgerIcon,
  SearchIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import { clearEp, clearSearch, searchAnimeList } from "../actions/animeActions";
import { useDispatch, useSelector } from "react-redux";
import SearchResultCard from "../components/search-result-card";

export const HomeScreen = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = React.useState("");
  const handleSearchChange = (event) => {
    setQuery(event.target.value);
  };

  const { animes, loading, error } = useSelector(
    (state) => state.animeSearchList
  );
  console.log(error);
  console.log(animes);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && query) {
      dispatch(searchAnimeList(query));
      dispatch(clearEp());
    }
    if (!query) {
      dispatch(clearSearch());
    }
  };

  return (
    <Flex w="100%" h="100%" direction="column" bg={"gray.900"}>
      <Flex
        align="center"
        justify="center"
        direction="column"
        w="100%"
        h="100%"
        pt={"20px"}
      >
        <Image
          objectFit="cover"
          src="/images/home_screen_logo.png"
          alt="logo"
        />{" "}
        <Box w="50%" sx={{ position: "relative" }}>
          <InputGroup>
            <InputRightElement
              pointerEvents="none"
              children={
                <Box mr="2">
                  <Kbd>Enter</Kbd>
                </Box>
              }
            />
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color="gray.300" />}
            />
            z
            <Input
              sx={{ position: "relative" }}
              color={"font.main"}
              placeholder="Search Anime"
              onKeyDown={handleKeyDown}
              value={query}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Box>
        {/* {!loading && animes && 
        
        } />} */}
        {!loading && animes && (
          <Box
            sx={{
              marginTop: "10px",
              maxWidth: "100%",
              maxHeight: "100%",

              height: "100%",
              width: "100%",
              overflowX: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
                borderRadius: "8px",
                backgroundColor: `rgba(255, 255, 255, 0.2)`,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: `rgba(255, 255, 255, 0.2)`,
              },
              justifyContent: "center",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {animes.map((anime) => {
              return (
                <SearchResultCard
                  data={anime}
                  cardWidth={"250px"}
                  cardMargin={"10px 30px"}
                  maxImgWidth={"180px"}
                />
              );
            })}
          </Box>
        )}
        {!loading && error && (
          <Box textAlign="center" py={10} px={6}>
            <Image
              src="/images/not-found.png"
              alt="not-found"
              height={200}
              display={"flex"}
              justifyContent={"center"}
              margin={"0 auto"}
            />
            <Text fontSize="18px" mt={3} mb={2}>
              Anime Not Found
            </Text>
            <Text color={"gray.500"} mb={6}>
              The result you're looking for does not seem to exist
            </Text>
          </Box>
        )}
        {loading && (
          <Image src="/images/loader-serch.gif" alt="loader" boxSize="150px" />
        )}
      </Flex>
    </Flex>
  );
};
