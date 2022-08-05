import axios from "axios";
import {
  ANIME_DOWNLOAD_FAIL,
  ANIME_DOWNLOAD_REQUEST,
  ANIME_DOWNLOAD_SUCCESS,
  ANIME_EPISODE_ADD_FAIL,
  ANIME_EPISODE_ADD_REQUEST,
  ANIME_EPISODE_ADD_SUCCESS,
  ANIME_SEARCH_CLEAR,
  ANIME_SEARCH_FAIL,
  ANIME_SEARCH_REQUEST,
  ANIME_SEARCH_SUCCESS,
  ANIME_STREAM_DETAILS_FAIL,
  ANIME_STREAM_DETAILS_REQUEST,
  ANIME_STREAM_DETAILS_SUCCESS,
  ANIME_STREAM_EXTERNAL_FAIL,
  ANIME_STREAM_EXTERNAL_REQUEST,
  ANIME_STREAM_EXTERNAL_SUCCESS,
  
  ANIME_STREAM_URL_FAIL,
  ANIME_STREAM_URL_REQUEST,
  ANIME_STREAM_URL_SUCCESS,
  DOWNLOAD_LIBRARY_FAIL,
  DOWNLOAD_LIBRARY_REQUEST,
  DOWNLOAD_LIBRARY_SUCCESS,
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
export const addEpisodeDetails = (data) => async (dispatch) => {
  console.log(data);
  try {
    dispatch({ type: ANIME_EPISODE_ADD_REQUEST });

    dispatch({ type: ANIME_EPISODE_ADD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_EPISODE_ADD_FAIL, payload: error });
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

export const playVideoExternal = (url) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_STREAM_EXTERNAL_REQUEST });
    // console.log(anime_session, ep_session);
    const { data } = await axios.post(
      `/stream`,
      {
        video_url: url,
        player: "mpv",
      },
      {
        "Content-Type": "application/json",
      }
    );

    console.log(data);
    dispatch({ type: ANIME_STREAM_EXTERNAL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_STREAM_EXTERNAL_FAIL, payload: error });
  }
};
export const getVideoUrl = (pahewin_url) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_STREAM_URL_REQUEST });
    // console.log(anime_session, ep_session);
    const { data } = await axios.post(
      `/get_video_url`,
      {
        pahewin_url,
      },
      {
        "Content-Type": "application/json",
      }
    );

    console.log(data);
    dispatch({ type: ANIME_STREAM_URL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_STREAM_URL_FAIL, payload: error });
  }
};

export const downloadVideo = (url) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_DOWNLOAD_REQUEST });
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
    dispatch({ type: ANIME_DOWNLOAD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_DOWNLOAD_FAIL, payload: error });
  }
};

export const getDownloadHistory = () => async (dispatch) => {
  try {
    dispatch({ type: DOWNLOAD_LIBRARY_REQUEST });

    const { data } = await axios.get(`/library`);
    console.log(data);

    dispatch({ type: DOWNLOAD_LIBRARY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: DOWNLOAD_LIBRARY_FAIL, payload: error });
  }
};
