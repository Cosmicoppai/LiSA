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
} from "@chakra-ui/react";
import React, { useState } from "react";
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
  const { details: eps_details, loading: eps_loading } = useSelector(
    (state) => state.animeEpisodesDetails
  );

  console.log(urlDetails);
  const [language, setLanguage] = useState("jpn");
  const [prevTime, setPrevTime] = useState(null);
  const [player, setPlayer] = useState(undefined);

  const languageChangeHandler = (e) => {
    setPrevTime(player.currentTime())
    setLanguage(e.target.value);
  };

  return (
    <Center py={6} w="100%">
      <Flex
        flexDirection={"column"}
        justifyContent="center"
        alignItems={"center"}
        w="100%"
        maxWidth={"1200px"}
      >
        {epDetails && anime && (
          <Box w="100%">
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              {anime.jp_name ? `${anime.jp_name}` : ""}{" "}
              {anime.eng_name ? ` | ${anime.eng_name}` : ""}
            </Heading>

            <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
              {`Episode ${epDetails?.details?.current_ep}`}
            </Text>

            {details && language && epDetails && (
              <VideoPlayer
                url={details[language]}
                epDetails={epDetails}
                player={player}
                setPlayer={setPlayer}
                prevTime={prevTime}
              />
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
          />
        </Stack>
      </Flex>
    </Center>
  );
};

export default InbuiltPlayerScreen;
