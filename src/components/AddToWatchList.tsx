import {
    Flex,
    Icon,
    Text,
    Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { LuListPlus, LuListX } from "react-icons/lu";
import server from "src/utils/axios";

export function AddToWatchList({
    mylist,
    jp_name,
    no_of_episodes,
    type,
    status,
    season,
    year,
    score,
    poster,
    anime_id,
}) {

    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        setIsAdded(mylist);
    }, [mylist])

    async function addToMyList() {
        await server.post(`/watchlist`, {
            jp_name,
            no_of_episodes,
            type,
            status,
            season,
            year,
            score,
            poster,
            anime_id,
        }, {
            // @ts-ignore
            "Content-Type": "application/json",
        });
        setIsAdded(true);
    }

    async function removefromMyList() {
        if (anime_id) await server.delete(`/watchlist?anime_id=${anime_id}`);
        setIsAdded(false);
    }

    return (
        <Tooltip label={isAdded ? "Remove from My List" : "Add to My List"} placement="top">
            <Flex
                cursor={"pointer"}
                borderRadius={14}
                justifyContent="center"
                alignItems="center"
                p={2}
                _hover={{
                    bg: "#E2E8F029"
                }}
                bg={isAdded ? "#10495F" : "brand.900"}
                onClick={isAdded ? removefromMyList : addToMyList}>
                <Icon
                    as={isAdded ? LuListX : LuListPlus}
                    w={8}
                    h={8}
                    color={"white"}
                />
            </Flex>
        </Tooltip>
    )
}