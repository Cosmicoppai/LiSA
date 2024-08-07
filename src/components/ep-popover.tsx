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
} from '@chakra-ui/react';
import { useState } from 'react';
import { useDownloadVideo } from 'src/hooks/useDownloadVideo';
import { useGetAnimeStream } from 'src/hooks/useGetAnimeStream';
import { usePlayVideoExternal } from 'src/hooks/usePlayVideoExternal';

export function EpPopover({ isOpen, onClose }) {
    const {
        data: { streamDetails: details },
    } = useGetAnimeStream();

    const [language, setLanguage] = useState(null);
    const [quality, setQuality] = useState(null);

    const { downloadVideo } = useDownloadVideo();

    const { playVideoExternalMutation } = usePlayVideoExternal();

    const playHandler = () => {
        if (Object.values(Object.values(details[language])[0])[0]) {
            playVideoExternalMutation.mutate(Object.values(Object.values(details[language])[0])[0]);
        }
    };
    const downloadHandler = () => {
        if (Object.values(Object.values(details[language])[0])[0]) {
            downloadVideo(Object.values(Object.values(details[language])[0])[0]);
        }
    };
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
                                    onChange={(e) => setLanguage(e.target.value)}>
                                    {Object.keys(details).map((language, idx) => {
                                        return (
                                            <option key={idx} value={language}>
                                                {language}
                                            </option>
                                        );
                                    })}
                                </Select>
                                <Select
                                    placeholder="Quality"
                                    size="lg"
                                    disabled={!language}
                                    onChange={(e) => setQuality(e.target.value)}>
                                    {/* @ts-ignore */}
                                    {details[language]?.map?.((quality, idx) => {
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
                            <Button colorScheme="blue" mr={3}>
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
}
