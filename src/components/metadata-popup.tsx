import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Progress,
    Text,
} from "@chakra-ui/react";
import React from "react";

const MetaDataPopup = ({ onClose, onOpen, isOpen }) => {
    const cancelRef = React.useRef();
    return (
        <>
            <AlertDialog
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
        </>
    );
};

export default MetaDataPopup;
