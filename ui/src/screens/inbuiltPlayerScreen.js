import { Button, Center, Flex, Image, Select, Stack } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  downloadVideo,
  getVideoUrl,
  playVideoExternal,
} from "../actions/animeActions";

const InbuiltPlayerScreen = () => {
  const dispatch = useDispatch();
  const { details, loading } = useSelector((state) => state.animeStreamDetails);

  const epDetails = useSelector((state) => state.animeEpisodeDetails);
  const urlDetails = useSelector((state) => state.animeEpUrl);

  console.log(urlDetails);
  const [language, setLanguage] = useState(null);
  const [quality, setQuality] = useState(null);

  const qualityChangeHandler = (value) => {
    setQuality(value);
    dispatch(
      getVideoUrl(Object.values(Object.values(details[language])[0])[0])
    );
  };

  const playHandler = () => {
    if (urlDetails?.url?.video_url) {
      dispatch(playVideoExternal(urlDetails?.url?.video_url));
    }
  };

  const downloadHandler = () => {
    if (urlDetails?.url?.video_url) {
      dispatch(
        downloadVideo(urlDetails?.url?.video_url)
      );
    }
  };

  return (
    <Center py={6} w="100%">
      {epDetails && details && (
        <Stack
          borderWidth="1px"
          borderRadius="lg"
          w={{ sm: "100%", md: "80%" }}
          justifyContent="space-between"
          direction={"column"}
          bg={"gray.900"}
          boxShadow={"2xl"}
          padding={4}
        >
          <Flex flex={1} bg="blue.200">
            <Image
              objectFit="contain"
              boxSize="100%"
              maxHeight={"500px"}
              src={epDetails?.details?.snapshot}
            />
          </Flex>
          <Flex
            flex={1}
            justifyContent={"space-evenly"}
            alignItems={"center"}
            p={1}
            pt={2}
            gap={6}
          >
            <Select
              flex={1}
              placeholder="Language"
              size="lg"
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.keys(details).map((language, idx) => {
                return (
                  <option key={idx} value={language}>
                    {language === "jpn"
                      ? "Japanese"
                      : language === "eng"
                      ? "English"
                      : language}
                  </option>
                );
              })}
            </Select>
            <Select
              flex={1}
              placeholder="Quality"
              size="lg"
              disabled={!language}
              onChange={(e) => qualityChangeHandler(e.target.value)}
            >
              {details[language]?.map((quality, idx) => {
                return (
                  <option key={idx} value={Object.keys(quality)[0]}>
                    {Object.keys(quality)[0]}p
                  </option>
                );
              })}
            </Select>
            <Button
              flex={1}
              onClick={playHandler}
              isLoading={urlDetails?.loading}
              disabled={!quality || !language}
            >
              Play in external player
            </Button>
            <Button
              flex={0.5}
              isLoading={urlDetails?.loading}
              onClick={downloadHandler}
              disabled={!quality || !language}
            >
              Download
            </Button>
          </Flex>
        </Stack>
      )}
    </Center>
  );
};

export default InbuiltPlayerScreen;
