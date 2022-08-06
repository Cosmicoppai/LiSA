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
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  downloadVideo,
  getVideoUrl,
  playVideoExternal,
} from "../actions/animeActions";
import VideoPlayer from "../components/video-player";

const InbuiltPlayerScreen = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const dispatch = useDispatch();
  const { details, loading } = useSelector((state) => state.animeStreamDetails);

  const epDetails = useSelector((state) => state.animeEpisodeDetails);
  const urlDetails = useSelector((state) => state.animeEpUrl);

  console.log(urlDetails);
  const [language, setLanguage] = useState(null);
  const [quality, setQuality] = useState(null);

  const qualityChangeHandler = (value) => {
    let templink = "";
    details[language].map((qualityLink) => {
      if (Object.keys(qualityLink)[0] === value) {
        templink = Object.values(qualityLink)[0];
      }
    });

    console.log(templink);
    setQuality(value);
    dispatch(getVideoUrl(templink));
  };

  const playHandler = (player) => {
    if (urlDetails?.url?.video_url) {
      dispatch(playVideoExternal(urlDetails?.url?.video_url, player));
    }
  };

  const downloadHandler = () => {
    if (urlDetails?.url?.video_url) {
      try {
        dispatch(
          downloadVideo(urlDetails?.url?.video_url, urlDetails?.url?.file_name)
        );

        toast({
          title: "Download Started",
          description:
            "Download has bee started. You can check in downloads sections",
          status: "success",
          duration: 6000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Center py={6} w="100%">
      {epDetails && details && (
        <Flex flexDirection={"column"}>
          <VideoPlayer url={urlDetails?.url?.video_url} epDetails={epDetails} />

          <Stack
            borderWidth="1px"
            borderRadius="lg"
            justifyContent="space-between"
            direction={"column"}
            bg={"gray.900"}
            boxShadow={"2xl"}
            padding={3}
          >
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
                onChange={(e) => {
                  console.log(e.target.value);
                  qualityChangeHandler(e.target.value);
                }}
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
                isLoading={urlDetails?.loading}
                disabled={!quality || !language}
                onClick={onOpen}
              >
                Play in external player
              </Button>
              {/* <Button
                flex={1}
                onClick={playHandler}
                isLoading={urlDetails?.loading}
                disabled={!quality || !language}
              >
                Play in external player
              </Button> */}
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
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Choose your favourite video player </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Flex
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Box
                    p={4}
                    onClick={() => playHandler("mpv")}
                    sx={{ cursor: "pointer" }}
                  >
                    <Image src="/assests/mpv.png" />
                  </Box>
                  <Box
                    p={4}
                    sx={{ cursor: "pointer" }}
                    onClick={() => playHandler("vlc")}
                  >
                    <Image src="/assests/vlc.png" />
                  </Box>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Flex>
      )}
    </Center>
  );
};

export default InbuiltPlayerScreen;
