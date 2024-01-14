import { Skeleton } from "@chakra-ui/react";
import { useQuery } from '@tanstack/react-query';

import server from "src/utils/axios";
import { MangaCard } from "./MangaCard";

async function getMangaList({ category }) {
    const { data } = await server.get(`top?type=manga&c=${category}&limit=0`);
    return data;
}

export function ExploreMangaCategories({
    category
}) {

    const {
        data,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["manga-list", category],
        queryFn: () => getMangaList({ category }),
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
                    <MangaCard key={index} data={anime} query={category} />
                )
            }
        </ul>
    );
}
