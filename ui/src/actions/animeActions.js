import axios from "axios";
import {
  ANIME_SEARCH_CLEAR,
  ANIME_SEARCH_FAIL,
  ANIME_SEARCH_REQUEST,
  ANIME_SEARCH_SUCCESS,
  ANIME_STREAM_DETAILS_FAIL,
  ANIME_STREAM_DETAILS_REQUEST,
  ANIME_STREAM_DETAILS_SUCCESS,
  ANIME_STREAM_FAIL,
  ANIME_STREAM_REQUEST,
  ANIME_STREAM_SUCCESS,
} from "../constants/animeConstants";

export const searchAnimeList = (query) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_SEARCH_REQUEST });

    const { data } = await axios.get(`/search?anime=${query}`);

    console.log(data);
    dispatch({ type: ANIME_SEARCH_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_SEARCH_FAIL, payload: error });
  }
};
export const clearSearch = () => async (dispatch) => {
  dispatch({ type: ANIME_SEARCH_CLEAR });
};

export const getStreamDetails =
  (anime_session, ep_session) => async (dispatch) => {
    try {
      dispatch({ type: ANIME_STREAM_DETAILS_REQUEST });
      console.log(anime_session, ep_session);
      const { data } = await axios.get(`/stream_details`, {
        params: {
          anime_session,
          ep_session,
        },
      });

      console.log(data);
      dispatch({ type: ANIME_STREAM_DETAILS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({ type: ANIME_STREAM_DETAILS_FAIL, payload: error });
    }
  };

export const playVideo = (url) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_STREAM_REQUEST });
    // console.log(anime_session, ep_session);
    const { data } = await axios.post(
      `/stream`,
      {
        pahewin_url: url,
        player: "mpv",
      },
      {
        "Content-Type": "application/json",
      }
    );

    console.log(data);
    dispatch({ type: ANIME_STREAM_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_STREAM_FAIL, payload: error });
  }
};

export const downloadVideo = (url) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_STREAM_REQUEST });
    const { data } = await axios.post(
      `/download`,
      {
        pahewin_url: url,
      },
      {
        "Content-Type": "application/json",
      }
    );

    console.log(data);
    dispatch({ type: ANIME_STREAM_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_STREAM_FAIL, payload: error });
  }
};



export const getDownloadHistory = () => async (dispatch) => {
  try {
    dispatch({ type: ANIME_SEARCH_REQUEST });

    const { data } = await axios.get(`/library`);

    dispatch({ type: ANIME_SEARCH_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_SEARCH_FAIL, payload: error });
  }
};