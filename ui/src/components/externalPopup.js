import {
  Box,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { playVideoExternal } from "../actions/animeActions";

const ExternalPlayerPopup = ({ isOpen, onOpen, onClose, language }) => {
  const dispatch = useDispatch();

  const { error: externalError, loading: externalLoading } = useSelector(
    (state) => state.animeStreamExternal
  );
  const { details } = useSelector((state) => state.animeStreamDetails);

  const playHandler = (player) => {
    console.log(player);
    if (details) {
      dispatch(playVideoExternal(details[language], player));

      onClose();
    }
  };

  return (
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
          {externalError && (
            <Text align={"center"} color="red.300">
              {externalError ? externalError["error"] : ""}
            </Text>
          )}
          {externalLoading && (
            <Box>
              {" "}
              <Progress size="xs" isIndeterminate />
              <Text align={"center"} mt={2}>
                Loading video in your local player, Please wait..
              </Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExternalPlayerPopup;