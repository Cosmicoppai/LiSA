import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Box, Grid, GridItem } from "@chakra-ui/react";

import "./styles/App.css";

import { useSocketContext } from "./context/socket";
import useSocketStatus from "./hooks/useSocketStatus";

import { Navbar } from "./components/navbar";

import { NotFoundScreen } from "./screens/NotFoundScreen";
import { HomeScreen } from "./screens/homeScreen";
import { ExploreScreen } from "./screens/exploreScreen";
import { DownloadScreen } from "./screens/DownloadsScreen";
import { MyListScreen } from "./screens/MyListScreen";
import SettingScreen from "./screens/settingScreen";

import AnimeDetailsScreen from "./screens/animeDetailsScreen";
import InbuiltPlayerScreen from "./screens/inbuiltPlayerScreen";

type TCookieReq = {
    data: {
        type: "cookie_request";
        site_url: string;
        user_agent: string;
    };
};

export default function App() {
    const { isSocketConnected } = useSocketStatus();

    const client = useSocketContext();

    console.log("client", client);

    useEffect(() => {
        if (!client) return;
        else if (client.readyState === 1) {
            client.send(JSON.stringify({ type: "connect" }));
            console.log("WebSocket Client Connected");
            //@ts-ignore
            client.onmessage = (message) => {
                const msg: TCookieReq = message?.data;

                console.log("eee", msg);

                // @ts-ignore
                window.electronAPI?.requestData(msg).then((response) => {
                    console.log("apisss", response);

                    client.send(
                        JSON.stringify({
                            type: "cookie_request",
                            data: response,
                        })
                    );
                });
            };
            // client.onopen = () => {
            //   console.log("WebSocket Client Connected");
            //   client.send(JSON.stringify({ type: "connect" }));
            // };
        }

        () => client.close();
    }, [isSocketConnected, client, window]);

    return (
        <HashRouter>
            <Grid templateColumns="repeat(1, 0.04fr 1fr)" w={"100%"} h={"100%"} overflow={"hidden"}>
                <GridItem
                    w="100%"
                    h={"100vh"}
                    maxWidth={"70px"}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <Navbar />
                </GridItem>
                <GridItem
                    w="100%"
                    h={"100vh"}
                    bg={"gray.900"}
                    sx={{
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                            width: "8px",
                            borderRadius: "8px",
                            backgroundColor: `rgba(255, 255, 255, 0.2)`,
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: `rgba(255, 255, 255, 0.2)`,
                        },
                    }}>
                    <Box sx={{ width: "100%", height: "100%" }}>
                        <Routes>
                            <Route path="/" element={<HomeScreen />} />
                            <Route path="explore" element={<ExploreScreen />} />
                            <Route path="download" element={<DownloadScreen />} />
                            <Route path="mylist" element={<MyListScreen />} />
                            <Route path="setting" element={<SettingScreen />} />

                            <Route path="anime-details" element={<AnimeDetailsScreen />} />
                            <Route path="play" element={<InbuiltPlayerScreen />} />
                            <Route path="*" element={<NotFoundScreen />} />
                        </Routes>
                    </Box>
                </GridItem>
            </Grid>
        </HashRouter>
    );
}
