import server from "../axios";
import {
  ANIME_DOWNLOAD_FAIL,
  ANIME_DOWNLOAD_REQUEST,
  ANIME_DOWNLOAD_SUCCESS,
} from "../constants/downloadConstants";

export const downloadVideo = (payload) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_DOWNLOAD_REQUEST });
    const { data } = await server.post(`/download`, payload, {
      "Content-Type": "application/json",
    });

    console.log(data);
    dispatch({ type: ANIME_DOWNLOAD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_DOWNLOAD_FAIL, payload: error });
  }
};
