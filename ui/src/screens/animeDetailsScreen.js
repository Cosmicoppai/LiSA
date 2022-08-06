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
  useDisclosure,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMonitor } from "react-icons/fi";
import { addEpisode, addEpisodeDetails, clearEp, getStreamDetails } from "../actions/animeActions";


export default function AnimeDetailsScreen() {
  const dispatch = useDispatch();
  const { animes: data, loading } = useSelector(
    (state) => state.animeSearchList
  );

  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!data) {
      navigate("/");
    }
  }, [data]);

  const episodeClickHandler = (item) => {
    dispatch(clearEp());

    dispatch(getStreamDetails(data.session, item.ep_session));
    dispatch(addEpisodeDetails(item));
    navigate("/play");
  };

  return (
    <Center py={6} w="100%">
      {data && (
        <Stack
          borderWidth="1px"
          borderRadius="lg"
          w={{ sm: "100%", md: "80%" }}
          justifyContent="space-between"
          direction={{ base: "column", md: "row" }}
          bg={"gray.900"}
          boxShadow={"2xl"}
          padding={4}
        >
          <Flex flex={1} bg="blue.200" maxW={"30%"} maxHeight={"500px"}>
            <Image objectFit="contain" boxSize="100%" src={data.poster} />
          </Flex>
          <Stack
            maxW={"65%"}
            flex={1}
            flexDirection="column"
            alignItems="flex-start"
            p={1}
            pt={2}
          >
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              {`${data.eng_name}`}
              {data.jp_name ? ` | ${data.jp_name}` : ""}
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
                <Text ml="1">{data.description.Type}</Text>
              </Badge>
              <Badge px={2} py={1} fontWeight={"400"}>
                {data.description.Aired}
              </Badge>
              <Badge px={2} py={1} fontWeight={"400"}>
                {data.description.Status}
              </Badge>
            </Stack>
            <Text color={"gray.400"} px={3}>
              {data.description.Synopsis}
            </Text>

            <Box mt={5}>
              <Flex direction={"row"} flexWrap="wrap">
                {data.episode_details.ep_details.map((item, key) => {
                  return (
                    <Flex
                      cursor={"pointer"}
                      key={key}
                      p={2}
                      mr={2}
                      mt={2}
                      bg="brand.900"
                      width={"100%"}
                      maxWidth={"50px"}
                      justifyContent="center"
                      onClick={() =>
                        episodeClickHandler(Object.values(item)[0])
                      }
                    >
                      <Text textAlign={"center"}>{Object.keys(item)[0]}</Text>
                    </Flex>
                  );
                })}
              </Flex>
              {/* <EpPopover isOpen={isOpen} onOpen={onOpen} onClose={onClose} /> */}
            </Box>
          </Stack>
        </Stack>
      )}
    </Center>
  );
}
