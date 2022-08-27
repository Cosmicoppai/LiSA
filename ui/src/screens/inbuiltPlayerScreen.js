import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  useDisclosure,
  useToast,
  Text,
  Heading,
  Progress,
  Skeleton,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addCurrentEp,
  addEpisodesDetails,
  clearEp,
  downloadVideo,
  getRecommendations,
  getStreamDetails,
  getVideoUrl,
  playVideoExternal,
  searchAnimeList,
} from "../actions/animeActions";
import VideoPlayer from "../components/video-player";
import { Link, useNavigate } from "react-router-dom";
import PaginateCard from "../components/paginateCard";
import SearchResultCard from "../components/search-result-card";
import server from "../axios";

const InbuiltPlayerScreen = () => {
  // const navigate = useNavigate();

  // const toast = useToast();
  // const { isOpen, onOpen, onClose } = useDisclosure();

  const dispatch = useDispatch();
  const { details } = useSelector((state) => state.animeStreamDetails);
  // const { error: externalError, loading: externalLoading } = useSelector(
  //   (state) => state.animeStreamExternal
  // );

  const { animes: data, loading } = useSelector(
    (state) => state.animeSearchList
  );

  const epDetails = useSelector((state) => state.animeCurrentEp);
  const urlDetails = useSelector((state) => state.animeEpUrl);
  const { details: anime } = useSelector((state) => state.animeDetails);

  const { details: recommendations } = useSelector(
    (state) => state.animeRecommendations
  );
  const { details: eps_details, loading: eps_loading } = useSelector(
    (state) => state.animeEpisodesDetails
  );

  const [language, setLanguage] = useState("jpn");
  const [prevTime, setPrevTime] = useState(null);
  const [player, setPlayer] = useState(undefined);

  const languageChangeHandler = (e) => {
    setPrevTime(player.currentTime());
    setLanguage(e.target.value);
  };
  let ep_no = parseInt(epDetails?.details?.current_ep);

  const pageChangeHandler = async (url) => {
    if (url) {
      const { data } = await server.get(url);
      dispatch(addEpisodesDetails({ ...data, current_ep: ep_no + 1 }));
    }
  };
  let current_page_eps = eps_details.ep_details;

  const nextEpHandler = () => {
    if (
      ep_no == Object.keys(current_page_eps[current_page_eps.length - 1])[0]
    ) {
      if (eps_details.next_page_url) {
        pageChangeHandler(eps_details.next_page_url);
      } else {
        return;
      }
    }

    let item;

    current_page_eps.map((single_ep) => {
      if (Object.keys(single_ep)[0] == ep_no) {
        item = Object.values(single_ep)[0];
      }
    });

    if (item) {
      dispatch(getStreamDetails(item.stream_detail));
      dispatch(
        addCurrentEp({
          ...item,
          current_ep: ep_no + 1,
        })
      );
      console.log(item);
    }
  };
  const prevEpHandler = () => {
    if (ep_no == Object.keys(current_page_eps[0])[0]) {
      if (eps_details.prev_page_url) {
        pageChangeHandler(eps_details.prev_page_url);
      } else {
        return;
      }
    }

    let item;

    current_page_eps.map((single_ep) => {
      if (Object.keys(single_ep)[0] == ep_no) {
        item = Object.values(single_ep)[0];
      }
    });

    if (item) {
      dispatch(getStreamDetails(item.stream_detail));
      dispatch(
        addCurrentEp({
          ...item,
          current_ep: ep_no - 1,
        })
      );
    }
  };

  return (
    <Center py={6} w="100%">
      <Flex
        flexDirection={"column"}
        justifyContent="center"
        alignItems={"center"}
        w="90%"
        margin={"0 auto"}
      >
        {epDetails && anime && (
          <Box w="100%">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Heading fontSize={"2xl"} fontFamily={"body"}>
                {anime.jp_name ? `${anime.jp_name}` : ""}{" "}
                {anime.eng_name ? ` | ${anime.eng_name}` : ""}
              </Heading>
              <Text fontWeight={600} color={"gray.500"} size="sm" ml={2}>
                {`| Episode ${epDetails?.details?.current_ep}`}
              </Text>
            </Box>

            {details && language && epDetails ? (
              <VideoPlayer
                url={details[language]}
                epDetails={epDetails}
                player={player}
                setPlayer={setPlayer}
                prevTime={prevTime}
                nextEpHandler={nextEpHandler}
              />
            ) : (
              <Skeleton width={"100%"} height={"660px"} />
            )}
          </Box>
        )}

        <Stack
          borderWidth="1px"
          borderRadius="lg"
          justifyContent="space-between"
          direction={"column"}
          bg={"gray.900"}
          boxShadow={"2xl"}
          padding={3}
          w="100%"
        >
          <Flex
            flex={1}
            justifyContent={"space-between"}
            alignItems={"center"}
            p={1}
            pt={2}
            gap={6}
          >
            <Button onClick={prevEpHandler} width={"max-content"}>
              Previous
            </Button>
            <Select
              placeholder="Language"
              size="md"
              value={language}
              onChange={languageChangeHandler}
              width={"max-content"}
            >
              {Object.keys(details || {}).map((language, idx) => {
                return (
                  <option key={idx} value={language}>
                    {language === "jpn"
                      ? "Japanese"
                      : language === "eng"
                      ? "English"
                      : ""}
                  </option>
                );
              })}
            </Select>
            <Button onClick={nextEpHandler} width={"max-content"}>
              Next
            </Button>
          </Flex>

          <PaginateCard
            data={data}
            ep_details={eps_details}
            loading={eps_loading}
            currentEp={epDetails?.details?.current_ep}
          />
        </Stack>
        <Box w="100%" mt={5}>
          <Heading fontSize={"2xl"} fontFamily={"body"}>
            Recommendations
          </Heading>
        </Box>

        <Stack
          mt={2}
          borderWidth="1px"
          borderRadius="lg"
          justifyContent="space-between"
          direction={"column"}
          bg={"gray.900"}
          boxShadow={"2xl"}
          padding={3}
          w="100%"
        >
          {!loading && recommendations && (
            <Box
              sx={{
                // position: "absolute",
                // top: 0,
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
              {recommendations
                ? recommendations.map((anime) => {
                    return (
                      <SearchResultCard
                        data={anime}
                        cardWidth={"270px"}
                        cardMargin={"10px 40px"}
                      />
                    );
                  })
                : Array(30)
                    .fill(0)
                    .map(() => (
                      <Skeleton
                        width={"200px"}
                        height={"300px"}
                        sx={{ padding: "1rem", margin: "10px auto" }}
                        padding={6}
                      />
                    ))}
            </Box>
          )}
        </Stack>
      </Flex>
    </Center>
  );
};

export default InbuiltPlayerScreen;
