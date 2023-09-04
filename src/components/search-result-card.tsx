import React from "react";
import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    Heading,
    Image,
    Spacer,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { addAnimeDetails } from "../actions/animeActions";
import { useDispatch } from "react-redux";
import { AiFillStar } from "react-icons/ai";

const SearchResultCard = ({ data, cardWidth, cardMargin, maxImgWidth }) => {
    const dispatch = useDispatch();

    const detailsClickHandler = () => {
        dispatch(addAnimeDetails(data));
    };

    return (
        <Link
            to="/anime-details"
            style={{
                textDecoration: "none",
                maxWidth: "200px",
                height: "max-content",
                // width: "45%",
                margin: cardMargin ? cardMargin : "10px 20px",
                display: "flex",
                justifyContent: "center",
            }}
            onClick={detailsClickHandler}>
            <Box sx={{ display: "flex", padding: "1rem", margin: "10px auto" }}>
                <Box
                    role={"group"}
                    p={6}
                    // maxW={cardWidth ? cardWidth : "200px"}
                    // w={cardWidth ? cardWidth : "200px"}
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

                            top: 5,
                            left: 0,
                            backgroundImage: `url(${data.poster})`,
                            filter: "blur(15px)",
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
                            minWidth={maxImgWidth ? maxImgWidth : "222px"}
                            minHeight={"222px"}
                            objectFit={"contain"}
                            src={data.poster}
                        />
                    </Box>
                    <Stack pt={5} align={"center"}>
                        <Flex flex={1} width={"100%"}>
                            <Text color={"gray.500"} fontSize={"sm"} textTransform={"uppercase"}>
                                {data.type}
                            </Text>
                            <Spacer />
                            {/* <Box sx={{ display: "flex" }}>
                <Text
                  color={"gray.500"}
                  fontSize={"sm"}
                  textTransform={"uppercase"}
                >
                  Rank
                </Text>
                <Text
                  fontWeight={500}
                  ml={1}
                  // color={"gray.500"}
                  fontSize={"sm"}
                  textTransform={"uppercase"}
                >
                  #{data.rank}
                </Text>
              </Box> */}
                        </Flex>

                        <Heading
                            fontSize={"xl"}
                            fontFamily={"body"}
                            fontWeight={500}
                            textAlign={"left"}
                            alignSelf={"flex-start"}
                            noOfLines={2}>
                            {data.jp_name ? `${data.jp_name}` : ""}
                            {data.eng_name ? ` | ${data.eng_name}` : ""}
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
                                    {data.episodes !== "?"
                                        ? "Ep " + data.no_of_episodes
                                        : "Running"}
                                </Text>
                            </Badge>
                        </Flex>
                    </Stack>
                </Box>
            </Box>
        </Link>
    );
};

export default SearchResultCard;
