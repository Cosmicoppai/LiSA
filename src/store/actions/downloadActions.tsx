import { useToast } from "@chakra-ui/react";
import server from "../../axios";
import {
    ANIME_DOWNLOAD_FAIL,
    ANIME_DOWNLOAD_REQUEST,
    ANIME_DOWNLOAD_SUCCESS,
} from "../constants/downloadConstants";
import { createStandaloneToast } from "@chakra-ui/toast";

const { toast } = createStandaloneToast();
export const downloadVideo = (payload) => async (dispatch) => {
    try {
        dispatch({ type: ANIME_DOWNLOAD_REQUEST });
        const { data } = await server.post(`/download`, payload, {
            "Content-Type": "application/json",
        });

        console.log(data);
        dispatch({ type: ANIME_DOWNLOAD_SUCCESS, payload: data });
        toast({
            title: "Download has been started, Please check downloads section.",
            status: "success",
            duration: 2000,
        });
    } catch (error) {
        console.log(error);
        if (error?.response?.data) {
            toast({
                title: error?.response?.data,
                status: "error",
                duration: 2000,
            });
        }

        dispatch({ type: ANIME_DOWNLOAD_FAIL, payload: error });
    }
};
