import {
    Box,
    Button,
    Center,
    Flex,
    Select,
    Stack,
    Text,
    Heading,
    Skeleton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

import { addCurrentEp, addEpisodesDetails, getStreamDetails } from "../store/actions/animeActions";
import VideoPlayer from "../components/video-player";
import PaginateCard from "../components/paginateCard";
import server from "../axios";

const InbuiltPlayerScreen = () => {
    const dispatch = useDispatch();
    const { details, loading: streamLoading } = useSelector((state) => state.animeStreamDetails);
    const navigate = useNavigate();

    const { animes: data, loading } = useSelector((state) => state.animeSearchList);

    const epDetails = useSelector((state) => state.animeCurrentEp);
    const urlDetails = useSelector((state) => state.animeEpUrl);
    const { details: anime } = useSelector((state) => state.animeDetails);

    const { details: eps_details, loading: eps_loading } = useSelector(
        (state) => state.animeEpisodesDetails
    );

    const [language, setLanguage] = useState("jpn");
    const [qualityOptions, setQualityOptions] = useState([]);
    const [test, setTest] = useState({});
    const [prevTime, setPrevTime] = useState(null);
    const [player, setPlayer] = useState(undefined);
    const [toogleRefresh, setToogleRefresh] = useState(Math.floor(Math.random() * 100000));

    const languageChangeHandler = (e) => {
        setPrevTime(player.currentTime());
        setLanguage(e.target.value);
    };
    let ep_no = parseInt(epDetails?.details?.current_ep);

    const pageChangeHandler = async (url) => {
        if (url) {
            const { data } = await server.get(url);
            dispatch(addEpisodesDetails({ ...data, current_ep: ep_no + 1 }));
        }
    };
    let current_page_eps = eps_details?.ep_details;

    const nextEpHandler = () => {
        setToogleRefresh(null);

        if (ep_no == Object.keys(current_page_eps[current_page_eps.length - 1])[0]) {
            if (eps_details.next_page_url) {
                pageChangeHandler(eps_details.next_page_url);
            } else {
                return;
            }
        }

        let item;

        current_page_eps.map((single_ep) => {
            if (Object.keys(single_ep)[0] == ep_no + 1) {
                console.log(single_ep);
                item = Object.values(single_ep)[0];
            }
        });

        if (item) {
            console.log("item", item);
            dispatch(getStreamDetails(item.stream_detail));
            dispatch(
                addCurrentEp({
                    ...item,
                    current_ep: ep_no + 1,
                })
            );
            console.log(item);

            setToogleRefresh(Math.floor(Math.random() * 100000));
        }
    };
    const prevEpHandler = () => {
        if (ep_no == Object.keys(current_page_eps[0])[0]) {
            if (eps_details.prev_page_url) {
                pageChangeHandler(eps_details.prev_page_url);
            } else {
                return;
            }
        }

        let item;

        current_page_eps.map((single_ep) => {
            if (Object.keys(single_ep)[0] == ep_no) {
                item = Object.values(single_ep)[0];
            }
        });

        if (item) {
            dispatch(getStreamDetails(item.stream_detail));
            dispatch(
                addCurrentEp({
                    ...item,
                    current_ep: ep_no - 1,
                })
            );
        }
    };

    useEffect(() => {
        if (!details || !player) return;
        if (!details[language]) return;
        player.src({
            src: details[language],
            type: "application/x-mpegURL",
            withCredentials: false,
        });
        player.poster("");
    }, [details, streamLoading]);
    console.log("streamLoading", streamLoading);
    console.log("player", player);

    useEffect(() => {
        if (window) {
            window?.scrollTo(0, 0);
        }
    }, []);

    return (
        <Center py={6} w="100%">
            <Flex
                flexDirection={"column"}
                justifyContent="center"
                alignItems={"center"}
                w="90%"
                margin={"0 auto"}>
                {epDetails && anime && (
                    <Box w="100%">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                                onClick={() => navigate("/anime-details")}
                                alignSelf={"flex-start"}
                                _hover={{
                                    cursor: "pointer",
                                }}
                                display="flex"
                                justifyContent={"center"}
                                alignItems={"center"}
                                mr={6}
                                height={"fit-content"}
                                mt={1}>
                                <BiArrowBack />
                                <Text ml={1}>Back</Text>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexDirection: "row",
                                }}>
                                <Heading fontSize={"2xl"} fontFamily={"body"}>
                                    {anime.jp_name ? `${anime.jp_name}` : ""}{" "}
                                    {anime.eng_name ? ` | ${anime.eng_name}` : ""}
                                    {anime.title ? `${anime.title}` : ""}
                                </Heading>
                                <Text fontWeight={600} color={"gray.500"} size="sm" ml={2} mt={1}>
                                    {`| Episode ${epDetails?.details?.current_ep}`}
                                </Text>
                            </Box>
                        </Box>

                        {details && language && epDetails && !streamLoading ? (
                            <VideoPlayer
                                url={details[language]}
                                streamLoading={streamLoading}
                                epDetails={epDetails}
                                player={player}
                                setPlayer={setPlayer}
                                prevTime={prevTime}
                                nextEpHandler={nextEpHandler}
                                setQualityOptions={setQualityOptions}
                                qualityOptions={qualityOptions}
                            />
                        ) : (
                            <Skeleton width={"100%"} height={"660px"} mt={3} />
                        )}
                    </Box>
                )}

                <Stack
                    borderWidth="1px"
                    borderRadius="lg"
                    justifyContent="space-between"
                    direction={"column"}
                    bg={"gray.900"}
                    boxShadow={"2xl"}
                    padding={3}
                    w="100%">
                    <Flex
                        flex={1}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        p={1}
                        pt={2}
                        gap={6}>
                        <Button onClick={prevEpHandler} width={"max-content"}>
                            Previous
                        </Button>
                        <Select
                            // placeholder="Language"
                            size="md"
                            value={language}
                            onChange={languageChangeHandler}
                            width={"max-content"}>
                            {Object.keys(details || {}).map((language, idx) => {
                                return (
                                    <option key={idx} value={language}>
                                        {language === "jpn"
                                            ? "Japanese"
                                            : language === "eng"
                                                ? "English"
                                                : ""}
                                    </option>
                                );
                            })}
                        </Select>
                        <Button onClick={nextEpHandler} width={"max-content"}>
                            Next
                        </Button>
                    </Flex>

                    <PaginateCard
                        data={data}
                        ep_details={eps_details}
                        loading={eps_loading}
                        currentEp={epDetails?.details?.current_ep}
                        isSingleAvailable={true}
                        player={player}
                        qualityOptions={qualityOptions}
                        setTest={setTest}
                    />
                </Stack>
            </Flex>
        </Center>
    );
};

export default InbuiltPlayerScreen;
