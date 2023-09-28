import {
    Center,
    Stack
} from "@chakra-ui/react";
import { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    cancelLiveDownload,
    getDownloadHistory
} from "../store/actions/animeActions";
import { SocketContext } from "../context/socket";
import { ActiveDownloads } from "../components/ActiveDownloads";
import { DownloadsHistory } from "../components/DownloadsHistory";

export function DownloadScreen() {

    const dispatch = useDispatch();
    const [filesStatus, setFilesStatus] = useState({});
    const [connected, setConnected] = useState(false);

    // @ts-ignore
    const historyDetails = useSelector((state) => state.animeLibraryDetails);
    const client = useContext(SocketContext);


    useEffect(() => {
        // @ts-ignore
        dispatch(getDownloadHistory());

        if (!client) return;

        // client.onopen = () => {
        //   console.log("WebSocket Client Connected");
        //   client.send(JSON.stringify({ type: "connect" }));
        //   setConnected(true);
        //   setConnected(true);
        // };

        return () => {
            setConnected(false);
        };
    }, [client]);

    const onMessageListner = () => {
        // @ts-ignore
        client.onmessage = (message) => {
            let packet = JSON.parse(message.data);
            let { data } = packet;

            let tempData = data;

            setFilesStatus((prev) => {
                let temp = filesStatus;

                if (tempData.downloaded === tempData.total_size && tempData.total_size > 0) {
                    if (!filesStatus) return {};
                    // @ts-ignore
                    const { [tempData.id]: removedProperty, ...restObject } = filesStatus;

                    // sleep(5000);
                    // @ts-ignore
                    dispatch(getDownloadHistory());

                    return restObject;
                } else {
                    temp[tempData.id] = tempData;
                    let sec = {};
                    if (historyDetails?.details) {
                        historyDetails?.details?.forEach((history_item) => {
                            if (history_item.status !== "downloaded")
                                sec[history_item.id] = history_item;
                        });
                        return { ...sec, ...temp };
                    } else {
                        return filesStatus;
                    }
                }

                // console.log(temp);
            });

            // if (tempData.downloaded === tempData.total_size) {
            //   console.time()
            //   console.time()
            // }
        };
    };

    useEffect(() => {
        setFilesStatus(() => {
            let sec = {};
            historyDetails?.details?.forEach((history_item) => {
                if (history_item.status !== "downloaded") {
                    sec[history_item.id] = history_item;
                }
            });
            return { ...filesStatus, ...sec };
        });
    }, [historyDetails]);

    useEffect(() => {
        if (!client) return;
        onMessageListner();
    }, [filesStatus]);

    const cancelDownloadHandler = (id) => {
        cancelLiveDownload(id);

        setFilesStatus((prev) => {
            try {
                if (!filesStatus) return {};
                // @ts-ignore
                const { [id]: removedProperty, ...restObject } = filesStatus;

                return restObject;
            } catch (error) {
                console.log(error);
            }
        });
    };
    console.log(historyDetails);

    return (
        <Center py={6} w="100%">
            <Stack flex={1} flexDirection="column" p={1} pt={2} maxWidth={"90%"}>
                <ActiveDownloads
                    filesStatus={filesStatus}
                    cancelDownloadHandler={cancelDownloadHandler}
                />
                <DownloadsHistory
                    historyDetails={historyDetails}
                />
            </Stack>
        </Center>
    );
}