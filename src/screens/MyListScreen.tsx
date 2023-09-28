// @ts-nocheck

import { Box, Center, Flex, Heading, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { TbMoodSad } from "react-icons/tb";
import SearchResultCard from "src/components/search-result-card";
import server from "src/utils/axios";

async function getMyList() {
    const { data } = await server.get(`/watchlist`);
    return data;
}

export function MyListScreen() {

    const {
        data,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["anime-list"],
        queryFn: getMyList,
    });

    // @ts-ignore
    if (error) return <span style={{ textAlign: 'center', marginTop: 100 }}>An error occurred: {error.message}</span>;
    console.log(data);

    return (
        <Center py={6} w="100%">
            <Stack flex={1} flexDirection="column" p={1} pt={2} maxWidth={"90%"}>
                <Stack flex={1} flexDirection="column">
                    <Heading fontSize={"xl"} fontFamily={"body"}>
                        My List
                    </Heading>
                </Stack>
                <ul
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        marginTop: "20px",
                    }}
                >
                    {isLoading ?
                        Array(15).fill(0)
                            .map((data, index: number) =>
                                <Skeleton
                                    key={index}
                                    width={"300px"}
                                    height={"450px"}
                                    sx={{ padding: "1rem", margin: "10px auto" }}
                                    padding={6}
                                />
                            ) :

                        data?.data?.map((anime, index) =>
                            <SearchResultCard
                                key={index}
                                data={anime}
                                cardWidth={"250px"}
                                cardMargin={"10px 30px"}
                                maxImgWidth={"180px"}
                            />
                        )
                    }
                </ul>
                {/* @ts-ignore */}
                {!isLoading && data.data.length === 0 ?
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
                    </Flex> : null
                }
            </Stack>
        </Center>
    )
}