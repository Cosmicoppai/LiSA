import { useRef } from "react";

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogOverlay,
    Progress,
    Text,
} from "@chakra-ui/react";

export default function MetaDataPopup({ onClose, onOpen, isOpen }) {
    const cancelRef = useRef();
    return (
        // @ts-ignore
        <AlertDialog
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            isOpen={isOpen}
            isCentered
        >
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
};
