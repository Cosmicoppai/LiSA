import { Skeleton } from "@chakra-ui/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExploreDetails } from "../store/actions/animeActions";
import Card from "../components/card";

export function ExploreAnimeCategories({
    category
}) {

    const dispatch = useDispatch();

    const { loading, details } = useSelector((state) => {
        // @ts-ignore
        return state.animeExploreDetails;
    });

    useEffect(() => {
        // @ts-ignore
        dispatch(getExploreDetails(category));
    }, [category]);


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
            {details
                ? details?.data?.map((anime, index) => <Card key={index} data={anime} query={category} />
                )
                : Array(30).fill(0)
                    .map((data, index: number) => <Skeleton
                        key={index}
                        width={"300px"}
                        height={"450px"}
                        sx={{ padding: "1rem", margin: "10px auto" }}
                        padding={6} />
                    )}
        </ul>
    );
}
