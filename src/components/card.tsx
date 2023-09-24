// @ts-nocheck

import { Box, Heading, Text, Stack, Image, Flex, Badge, Spacer, useToast } from "@chakra-ui/react";
import { AiFillStar } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addAnimeDetails } from "../store/actions/animeActions";

export default function Card({ data, query }) {
    const navigate = useNavigate();
    const toast = useToast();

    const dispatch = useDispatch();

    const exploreCardHandler = () => {
        if (query !== "upcoming") {
            dispatch(addAnimeDetails(data));
            navigate("/anime-details");
        } else {
            toast({
                title: "Anime has not been aired yet! ❤️",
                status: "error",
                duration: 2000,
            });
        }
    };
    return (
        <Box
            sx={{ display: "flex", padding: "1rem", margin: "10px auto" }}
            onClick={exploreCardHandler}>
            <Box
                sx={{ cursor: "pointer" }}
                role={"group"}
                p={6}
                maxW={"270px"}
                w={"270px"}
                bg={"gray.800"}
                boxShadow={"2xl"}
                rounded={"lg"}
                pos={"relative"}
                zIndex={1}>
                {/* <div class="card_image">
          <img src={data.img_url} />
        </div> */}
                <Box
                    rounded={"lg"}
                    mt={-12}
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

                        top: 2,
                        left: 0,
                        backgroundImage: `url(${data.poster || data.img_url})`,
                        filter: "blur(10px)",
                        zIndex: -1,
                    }}
                    _groupHover={{
                        _after: {
                            filter: "blur(20px)",
                        },
                    }}>
                    <Image
                        rounded={"lg"}
                        // height={230}
                        // width={282}
                        objectFit={"fill"}
                        src={data.poster || data.img_url}
                        minWidth={"222px"}
                        minHeight={"316px"}
                    />
                </Box>
                <Stack pt={5} align={"center"}>
                    <Flex flex={1} width={"100%"}>
                        <Text color={"gray.500"} fontSize={"sm"} textTransform={"uppercase"}>
                            {data.anime_type}
                        </Text>
                        <Spacer />
                        <Box sx={{ display: "flex" }}>
                            <Text color={"gray.500"} fontSize={"sm"} textTransform={"uppercase"}>
                                Rank
                            </Text>
                            <Text
                                fontWeight={500}
                                ml={1}
                                // color={"gray.500"}
                                fontSize={"sm"}
                                textTransform={"uppercase"}>
                                #{data.rank}
                            </Text>
                        </Box>
                    </Flex>

                    <Heading
                        fontSize={"xl"}
                        fontFamily={"body"}
                        fontWeight={500}
                        textAlign={"left"}
                        alignSelf={"flex-start"}
                        noOfLines={2}>
                        {data.title}
                    </Heading>
                    <Flex
                        pt={2}
                        direction={"row"}
                        justifyContent={"space-between"}
                        flex={1}
                        width={"100%"}>
                        <Box display={"flex"} alignItems="center" justifyContent={"center"}>
                            <AiFillStar color="#FDCC0D" fontSize={"20px"} />
                            <Text ml={"5px"} fontWeight={800} fontSize={"sm"} mt={0}>
                                {data.score}
                            </Text>
                        </Box>
                        <Badge
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "5px",
                                p: 1,
                            }}>
                            <Text color={"gray.300"}>
                                {data.episodes !== "?" ? "Ep " + data.episodes : "Running"}
                            </Text>
                        </Badge>
                    </Flex>
                </Stack>
            </Box>
        </Box>
    );
}
