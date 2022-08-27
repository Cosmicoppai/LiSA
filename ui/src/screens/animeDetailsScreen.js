import React, { useEffect } from "react";
import {
  Badge,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  Icon,
  Box,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMonitor } from "react-icons/fi";
import {
  addEpisodesDetails,
  clearEp,
  getStreamDetails,
  searchAnimeList,
} from "../actions/animeActions";
import PaginateCard from "../components/paginateCard";
import { AiFillStar } from "react-icons/ai";

export default function AnimeDetailsScreen() {
  const dispatch = useDispatch();
  const { details: data, loading } = useSelector((state) => state.animeDetails);
  const { details, loading: ep_loading } = useSelector(
    (state) => state.animeEpisodesDetails
  );
  console.log(details);
  console.log("data", data);
  const navigate = useNavigate();

  // const nextPage = (item) => {
  //   // dispatch(clearEp());

  //   dispatch(getStreamDetails(data.session, item.ep_session));
  //   dispatch(addEpisodesDetails(item));
  //   if (redirect) {
  //     navigate("/play");
  //   }
  // };

  // useEffect(() => {
  //   if (!data && !loading) {
  //     navigate("/");
  //   }
  // }, [data]);

  return (
    <Center py={6} w="100%">
      {data && (
        <Stack
          borderWidth="1px"
          borderRadius="lg"
          w={{ sm: "100%", md: "80%" }}
          justifyContent="space-between"
          direction={{ base: "column", md: "row" }}
          boxShadow={"2xl"}
          padding={4}
        >
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
              backgroundImage: `url(${data.poster})`,
              filter: "blur(15px)",
              zIndex: 1,
            }}
            _groupHover={{
              _after: {
                filter: "blur(20px)",
              },
            }}
          >
            <Image
              rounded={"lg"}
              objectFit="contain"
              boxSize="100%"
              src={data.poster}
              zIndex={2}
            />
          </Box>

          <Stack
            maxW={"65%"}
            flex={1}
            flexDirection="column"
            alignItems="flex-start"
            p={1}
            pt={2}
          >
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              {data.jp_name ? `${data.jp_name}` : ""}{" "}
              {data.eng_name ? ` | ${data.eng_name}` : ""}
            </Heading>

            <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
              No of episodes {data.no_of_episodes}
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
                }}
              >
                <Icon as={FiMonitor} />
                <Text ml="1">{data.type}</Text>
              </Badge>
              <Badge px={2} py={1} fontWeight={"400"}>
                {data.status}
              </Badge>
              <Badge px={2} py={1} fontWeight={"400"}>
                <Box
                  display={"flex"}
                  alignItems="center"
                  justifyContent={"center"}
                >
                  <AiFillStar color="#FDCC0D" />
                  <Text ml={"5px"}>{data.score}</Text>
                </Box>
              </Badge>
            </Stack>
            <Text color={"gray.400"} px={3}>
              {details?.description?.synopsis}
            </Text>
            <div>
              <PaginateCard
                data={data}
                ep_details={details}
                loading={ep_loading}
                redirect
              />
            </div>
          </Stack>
        </Stack>
      )}
    </Center>
  );
}
