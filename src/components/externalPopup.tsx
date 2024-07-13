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
} from '@chakra-ui/react';
import { localImagesPath } from 'src/constants/images';
import { useGetAnimeStream } from 'src/hooks/useGetAnimeStream';
import { usePlayVideoExternal } from 'src/hooks/usePlayVideoExternal';

export function ExternalPlayerPopup({ isOpen, onClose, language, historyPlay, playId }) {
    const {
        data: { streamDetails: details },
    } = useGetAnimeStream();

    const { playVideoExternalMutation } = usePlayVideoExternal();

    const playHandler = async (player) => {
        try {
            if (historyPlay) {
                await playVideoExternalMutation.mutateAsync({
                    id: playId,
                    player,
                });
                onClose();
            } else {
                if (details) {
                    await playVideoExternalMutation.mutateAsync({
                        manifest_url: details[language],
                        player,
                    });
                    onClose();
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    // @ts-ignore
    const error = playVideoExternalMutation.error?.response?.data?.error;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            onCloseComplete={playVideoExternalMutation.reset}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Choose your favourite video player </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex display={'flex'} alignItems={'center'} justifyContent={'center'}>
                        <Box p={4} onClick={() => playHandler('mpv')} sx={{ cursor: 'pointer' }}>
                            <Image src={localImagesPath.mpv} />
                        </Box>
                        <Box p={4} sx={{ cursor: 'pointer' }} onClick={() => playHandler('vlc')}>
                            <Image src={localImagesPath.vlc} />
                        </Box>
                    </Flex>
                    {error && (
                        <Text align={'center'} color="red.300">
                            {error}
                        </Text>
                    )}
                    {playVideoExternalMutation.isPending && (
                        <Box>
                            <Progress size="xs" isIndeterminate />
                            <Text align={'center'} mt={2}>
                                Loading video in your local player, Please wait..
                            </Text>
                        </Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
