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
  addEpisodesDetails,
  clearEp,
  downloadVideo,
  getStreamDetails,
  getVideoUrl,
  playVideoExternal,
  searchAnimeList,
} from "../actions/animeActions";
import VideoPlayer from "../components/video-player";
import { Link, useNavigate } from "react-router-dom";
import PaginateCard from "../components/paginateCard";
import SearchResultCard from "../components/search-result-card";

const InbuiltPlayerScreen = () => {
  const navigate = useNavigate();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const dispatch = useDispatch();
  const { details } = useSelector((state) => state.animeStreamDetails);
  const { error: externalError, loading: externalLoading } = useSelector(
    (state) => state.animeStreamExternal
  );

  console.log(externalError);
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

  console.log(urlDetails);
  const [language, setLanguage] = useState("jpn");
  const [prevTime, setPrevTime] = useState(null);
  const [player, setPlayer] = useState(undefined);

  const languageChangeHandler = (e) => {
    setPrevTime(player.currentTime());
    setLanguage(e.target.value);
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
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              {anime.jp_name ? `${anime.jp_name}` : ""}{" "}
              {anime.eng_name ? ` | ${anime.eng_name}` : ""} 
              <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
              {`Episode ${epDetails?.details?.current_ep}`}
            </Text>

            </Heading>

            
            {details && language && epDetails ? (
              <VideoPlayer
                url={details[language]}
                epDetails={epDetails}
                player={player}
                setPlayer={setPlayer}
                prevTime={prevTime}
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
          {/* <Flex
            flex={1}
            justifyContent={"space-evenly"}
            alignItems={"center"}
            p={1}
            pt={2}
            gap={6}
          >
            <Button flex={1} disabled={!quality || !language}>
              Previous
            </Button>

          

            <Button
              flex={0.5}
              isLoading={urlDetails?.loading}
              onClick={downloadHandler}
              disabled={!quality || !language}
            >
              Download
            </Button>
            <Button flex={1} disabled={!quality || !language}>
              Next
            </Button>
          </Flex> */}
          <Select
            placeholder="Language"
            size="md"
            width={"max-content"}
            value={language}
            onChange={languageChangeHandler}
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
              {recommendations.map((anime) => {
                return <SearchResultCard data={anime} cardWidth={"270px"} cardMargin={"10px 40px"}/>;
              })}
            </Box>
          )}
        </Stack>
      </Flex>
    </Center>
  );
};

export default InbuiltPlayerScreen;
