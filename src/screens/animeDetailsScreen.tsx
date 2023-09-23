// @ts-nocheck

import { useEffect } from "react";
import {
    Badge,
    Center,
    Flex,
    Heading,
    Image,
    Stack,
    Text,
    Icon,
    Box,
    Skeleton,
    SkeletonText,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { FiMonitor } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";

import {
    getRecommendations,
} from "../store/actions/animeActions";

import PaginateCard from "../components/paginateCard";
import SearchResultCard from "../components/search-result-card";
import { AddToWatchList } from "src/components/AddToWatchList";

const { shell } = window.require("electron");

export default function AnimeDetailsScreen() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { details: data } = useSelector((state) => state.animeDetails);
    const { details, loading: ep_loading } = useSelector((state) => state.animeEpisodesDetails);

    const { details: recommendations, loading: recommendationLoading } = useSelector(
        (state) => state.animeRecommendations
    );

    const { loading } = useSelector((state) => state.animeSearchList);

    useEffect(() => {
        if (window) {
            window?.scrollTo(0, 0);
        }

        if (details.recommendation) {
            dispatch(getRecommendations(details.recommendation));
        }
    }, [details]);

    function ytToEmbeded(input) {
        return input.split("?")[1].slice(2);
    }
    console.log({ data, details })

    return (
        <Center py={6} w="100%">
            <Flex
                flexDirection={"column"}
                justifyContent="center"
                alignItems={"center"}
                w={{ sm: "90%" }}
                margin={"0 auto"}>
                <Box
                    onClick={() => navigate(-1)}
                    alignSelf={"flex-start"}
                    _hover={{
                        cursor: "pointer",
                    }}
                    mb={2}
                    display="flex"
                    justifyContent={"center"}
                    alignItems={"center"}>
                    <BiArrowBack />
                    <Text ml={1}>Back</Text>
                </Box>
                <Stack
                    borderWidth="1px"
                    borderRadius="lg"
                    w={"100%"}
                    justifyContent="space-between"
                    direction={{ base: "column", md: "row" }}
                    boxShadow={"2xl"}
                    padding={4}>
                    <Box
                        rounded={"lg"}
                        flex={1}
                        maxW={"30%"}
                        maxHeight={"500px"}
                        mt={0}
                        pos={"relative"}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        _after={{
                            transition: "all .3s ease",
                            content: '""',
                            w: "full",
                            h: "full",
                            pos: "absolute",

                            top: 5,
                            left: 0,
                            backgroundImage: `url(${data?.poster || data?.img_url})`,
                            filter: "blur(15px)",
                            zIndex: 1,
                        }}
                        _groupHover={{
                            _after: {
                                filter: "blur(20px)",
                            },
                        }}>
                        <Image
                            rounded={"lg"}
                            objectFit="contain"
                            boxSize="100%"
                            src={data?.poster || data?.img_url}
                            zIndex={2}
                        />
                    </Box>

                    <Stack
                        maxW={"65%"}
                        flex={1}
                        flexDirection="column"
                        alignItems="flex-start"
                        p={1}
                        pt={2}>
                        <Box
                            width={'100%'}
                        >
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <Heading fontSize={"2xl"} fontFamily={"body"} display="inline">
                                        {data.jp_name ? `${data.jp_name}` : ""}{" "}
                                        {data.title ? `${data.title}` : ""}
                                    </Heading>

                                    {!ep_loading ? (
                                        <Text
                                            fontWeight={600}
                                            color={"gray.500"}
                                            size="sm"
                                            display="inline"
                                            ml={1}
                                        >
                                            by {details?.description?.studio}
                                        </Text>
                                    ) : (
                                        <Skeleton
                                            height={"18px"}
                                            width={"100px"}
                                            alignSelf={"baseline"}
                                            display={"inline-block"}
                                        />
                                    )}
                                </div>
                                <AddToWatchList {...data} {...details} />
                            </div>
                            {!ep_loading ? (
                                <Heading fontSize={"xl"} fontFamily={"body"} display="block">
                                    {details?.description?.eng_name
                                        ? `${details?.description?.eng_name}`
                                        : ""}{" "}
                                </Heading>
                            ) : (
                                <Skeleton
                                    height={"18px"}
                                    width={"100px"}
                                    alignSelf={"baseline"}
                                    display={"block"}
                                />
                            )}

                        </Box>
                        <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
                            No of episodes{" "}
                            {data.no_of_episodes !== "?" ? data.no_of_episodes : "running"}
                            {data.episodes !== "?" ? data.episodes : "running"}
                        </Text>
                        <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
                            <Badge
                                px={2}
                                py={1}
                                fontWeight={"400"}
                                sx={{
                                    display: "flex",
                                    justifyContent: "content",
                                    alignItems: "center",
                                }}>
                                <Icon as={FiMonitor} />
                                <Text ml="1">{data.type}</Text>
                            </Badge>
                            {data.status && (
                                <Badge px={2} py={1} fontWeight={"400"}>
                                    {data.status}
                                </Badge>
                            )}
                            <Badge px={2} py={1} fontWeight={"400"}>
                                <Box display={"flex"} alignItems="center" justifyContent={"center"}>
                                    <AiFillStar color="#FDCC0D" />
                                    <Text ml={"5px"}>{data.score}</Text>
                                </Box>
                            </Badge>

                        </Stack>
                        {details?.description?.synopsis && !ep_loading ? (
                            <Text color={"gray.400"} px={3} pl={0} width="100%">
                                {details?.description?.synopsis}
                            </Text>
                        ) : (
                            <Stack align={"center"} justify={"center"} direction={"row"}>
                                <Text color={"gray.400"} width="100%" px={3} pl={0}>
                                    <SkeletonText
                                        mt="2"
                                        noOfLines={20}
                                        spacing="2"
                                        width={"100%"}
                                    />
                                </Text>
                            </Stack>
                        )}
                        <div>
                            <PaginateCard
                                recommendationLoading={recommendationLoading}
                                data={data}
                                ep_details={details}
                                loading={ep_loading}
                                redirect
                            />
                        </div>
                        <div>
                            <Text fontWeight={600} color={"gray.500"} size="sm" mt={4}>
                                External Links
                            </Text>
                            <Box>
                                {details?.description &&
                                    Object.entries(details?.description?.external_links).map(([key, value], index) => {
                                        return (
                                            <Tag
                                                key={index}
                                                onClick={() => shell.openExternal(value)}
                                                mr={2}
                                                sx={{ cursor: "pointer" }}>
                                                {key}
                                            </Tag>
                                        );
                                    }
                                    )}
                            </Box>
                        </div>
                    </Stack>
                </Stack>
                <Tabs width={"100%"} variant="enclosed" mt={5}>
                    <TabList>
                        <Tab>Trailer </Tab>
                        <Tab>Recommendations</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            {details?.description?.youtube_url ? (
                                <Stack
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    w={"100%"}
                                    justifyContent="space-between"
                                    boxShadow={"2xl"}>
                                    <div
                                        style={{
                                            overflow: "hidden",
                                            paddingBottom: "56.25%",
                                            position: "relative",
                                            height: 0,
                                        }}>
                                        <iframe
                                            width="853"
                                            style={{
                                                left: 0,
                                                top: 0,
                                                height: "100%",
                                                width: "100%",
                                                position: "absolute",
                                            }}
                                            height="480"
                                            src={`https://www.youtube.com/embed/${ytToEmbeded(
                                                details?.description?.youtube_url
                                            )}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                                        />
                                    </div>
                                </Stack>
                            ) : (
                                <Box>
                                    <Text>No trailer available</Text>
                                </Box>
                            )}
                        </TabPanel>
                        <TabPanel>
                            <Box>
                                <Stack
                                    mt={2}
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    justifyContent="space-between"
                                    direction={"column"}
                                    bg={"gray.900"}
                                    boxShadow={"2xl"}
                                    padding={0}
                                    w="100%">
                                    <Box
                                        sx={{
                                            // position: "absolute",
                                            // top: 0,
                                            marginTop: "10px",

                                            justifyContent: "center",
                                            display: "flex",
                                            flexWrap: "wrap",
                                        }}>
                                        {recommendations
                                            ? recommendations.map((anime, index) => {
                                                return (
                                                    <SearchResultCard
                                                        key={index}
                                                        data={anime}
                                                        cardWidth={"270px"}
                                                        cardMargin={"10px 40px"}
                                                    />
                                                );
                                            })
                                            : Array(30)
                                                .fill(0)
                                                .map((data, index) => (
                                                    <Skeleton
                                                        key={index}
                                                        width={"200px"}
                                                        height={"300px"}
                                                        sx={{
                                                            padding: "1rem",
                                                            margin: "10px auto",
                                                        }}
                                                        padding={6}
                                                    />
                                                ))}
                                    </Box>
                                </Stack>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Flex>
        </Center>
    );
}
