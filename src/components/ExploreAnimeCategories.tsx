import { Skeleton } from "@chakra-ui/react";
import Card from "./card";
import server from "src/utils/axios";
import { useQuery } from "@tanstack/react-query";

async function getAnimeList({ category }) {
    const { data } = await server.get(`top?type=anime&c=${category}&limit=0`);
    return data;
}

export function ExploreAnimeCategories({
    category
}) {

    const {
        data,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["anime-list", category],
        queryFn: () => getAnimeList({ category }),
    });

    // @ts-ignore
    if (error) return <span style={{ textAlign: 'center', marginTop: 100 }}>An error occurred: {error.message}</span>;

    return (
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
                Array(30).fill(0)
                    .map((data, index: number) => <Skeleton
                        key={index}
                        width={"300px"}
                        height={"450px"}
                        sx={{ padding: "1rem", margin: "10px auto" }}
                        padding={6} />
                    ) :
                data?.data?.map((anime, index) =>
                    <Card key={index} data={anime} query={category} />
                )
            }
        </ul>
    );
}
