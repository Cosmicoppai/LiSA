import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogOverlay,
    Progress,
    Text,
} from '@chakra-ui/react';
import { useRef } from 'react';

export function MetaDataPopup({ onClose, onOpen, isOpen }) {
    const cancelRef = useRef();
    return (
        <AlertDialog
            onClose={onClose}
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            isOpen={isOpen}
            isCentered>
            <AlertDialogOverlay />

            <AlertDialogContent>
                <AlertDialogHeader>Starting download</AlertDialogHeader>
                <AlertDialogBody>
                    <Progress size="xs" isIndeterminate />
                    <Text>Loading meta for requested files. Please wait</Text>
                </AlertDialogBody>
            </AlertDialogContent>
        </AlertDialog>
    );
}
