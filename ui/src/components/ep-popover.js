import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";

import React, { useState } from "react";
import {  playVideoExternal } from "../actions/animeActions";
import { downloadVideo } from "../actions/downloadActions";

const EpPopover = ({ isOpen, onOpen, onClose }) => {
  const dispatch = useDispatch();
  const { details, loading } = useSelector((state) => state.animeStreamDetails);
  const [language, setLanguage] = useState(null);
  const [quality, setQuality] = useState(null);

  const playHandler = () => {
    if (Object.values(Object.values(details[language])[0])[0]) {
      dispatch(
        playVideoExternal(Object.values(Object.values(details[language])[0])[0])
      );
    }
  };
  const downloadHandler = () => {
    if (Object.values(Object.values(details[language])[0])[0]) {
      dispatch(
        downloadVideo(Object.values(Object.values(details[language])[0])[0])
      );
    }
  };
  console.log(details);
  return (
    <>
      {details && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select quality and action</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack>
                <Select
                  placeholder="Language"
                  size="lg"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {Object.keys(details).map((language, idx) => {
                    return (
                      <option key={idx} value={language}>
                        {language}{" "}
                      </option>
                    );
                  })}
                </Select>
                <Select
                  placeholder="Quality"
                  size="lg"
                  disabled={!language}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  {details[language]?.map((quality, idx) => {
                    return (
                      <option key={idx} value={Object.keys(quality)[0]}>
                        {Object.keys(quality)[0]}p
                      </option>
                    );
                  })}
                </Select>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} >
                Play
              </Button>
              <Button colorScheme="blue" mr={3} onClick={playHandler}>
                External Play
              </Button>
              <Button colorScheme="blue" mr={3} onClick={downloadHandler}>
                Download
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default EpPopover;
