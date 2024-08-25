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
import { usePlayVideoExternal } from 'src/hooks/usePlayVideoExternal';

type TExternalPlayerPopup =
    | {
          type: 'manifest';
          manifest_url: string;
      }
    | {
          type: 'download_id';
          download_id: string | number;
      };

export function ExternalPlayerPopup({
    isOpen,
    onClose,
    data,
}: {
    isOpen: boolean;
    onClose: () => void;
    data: TExternalPlayerPopup;
}) {
    const { playVideoExternalMutation } = usePlayVideoExternal();

    function getPlayVideoExternalMutationData() {
        switch (data.type) {
            case 'manifest':
                return {
                    manifest_url: data.manifest_url,
                };
            case 'download_id':
                return {
                    id: data.download_id,
                };
            default:
                break;
        }
    }

    const playHandler = async (player) => {
        try {
            await playVideoExternalMutation.mutateAsync({
                ...getPlayVideoExternalMutationData(),
                player,
            });
            onClose();
        } catch (error) {
            console.error(error);
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
                        <Box p={4} sx={{ cursor: 'pointer' }} onClick={() => playHandler('mpv')}>
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
