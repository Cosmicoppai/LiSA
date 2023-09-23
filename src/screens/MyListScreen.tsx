import { Box, Center, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { TbMoodSad } from "react-icons/tb";
import SearchResultCard from "src/components/search-result-card";
import server from "src/utils/axios";

export function MyListScreen() {

    const [list, setList] = useState([]);

    useEffect(() => {
        getMyList();
    }, [])

    async function getMyList() {
        const { data } = await server.get(`/watchlist`);
        console.log(data);
        setList([...data.data])
    }

    return (
        <Center py={6} w="100%">
            <Stack flex={1} flexDirection="column" p={1} pt={2} maxWidth={"90%"}>
                <Stack flex={1} flexDirection="column">
                    <Heading fontSize={"xl"} fontFamily={"body"}>
                        My List
                    </Heading>
                </Stack>

                {list.length ?
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {list.map((anime, index: number) => {
                            return (
                                <SearchResultCard
                                    key={index}
                                    data={anime}
                                    cardWidth={"250px"}
                                    cardMargin={"10px 30px"}
                                    maxImgWidth={"180px"}
                                />
                            );
                        }
                        )}
                    </div>
                    :
                    <Flex
                        minHeight={200}
                        alignItems={"center"}
                        justifyContent="center"
                        p={3}
                        pt={2}
                        width={"100%"}
                    >
                        <Box color="gray.500" mr="2">
                            <TbMoodSad size={24} />
                        </Box>
                        <Text
                            fontWeight={600}
                            color={"gray.500"}
                            size="lg"
                            textAlign={"center"}>
                            Your List is Empty
                        </Text>
                    </Flex>
                }
            </Stack>
        </Center>
    )
}