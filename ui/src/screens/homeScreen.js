import React from "react";
import "../App.css";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
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
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import {
  DownloadIcon,
  HamburgerIcon,
  SearchIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import { clearSearch, searchAnimeList } from "../actions/animeActions";
import { useDispatch, useSelector } from "react-redux";
import SearchResultCard from "../components/search-result-card";
export const HomeScreen = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = React.useState("");
  const handleSearchChange = (event) => {
    setQuery(event.target.value);
  };

  const { animes, loading } = useSelector((state) => state.animeSearchList);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && query) {
      dispatch(searchAnimeList(query));
    }
    if (!query) {
      dispatch(clearSearch());
    }
  };

  return (
    <Flex w="100vw" h="100%" direction="column">
      
      <Flex
        align="center"
        justify="center"
        direction="column"
        w="100%"
        h="100%"
      >
        <Image
          objectFit="cover"
          src="/images/home_screen_logo.png"
          alt="logo"
        />{" "}
        <Box w="50%">
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
            <Input
              color={"font.main"}
              placeholder="Search Anime"
              onKeyDown={handleKeyDown}
              value={query}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Box>
        {!loading && animes && <SearchResultCard data={animes} />}
        {loading && (
          <Image src="/images/loader-serch.gif" alt="loader" boxSize="150px" />
        )}
      </Flex>
    </Flex>
  );
};
