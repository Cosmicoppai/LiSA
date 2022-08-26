import { useToast } from "@chakra-ui/react";
// import axios from "axios";
import server from "../axios";
import {
  ANIME_CURRENT_EP_FAIL,
  ANIME_CURRENT_EP_REQUEST,
  ANIME_CURRENT_EP_SUCCESS,
  ANIME_DETAILS_FAIL,
  ANIME_DETAILS_REQUEST,
  ANIME_DETAILS_SUCCESS,
  ANIME_DOWNLOAD_FAIL,
  ANIME_DOWNLOAD_REQUEST,
  ANIME_DOWNLOAD_SUCCESS,
  ANIME_EPISODES_ADD_FAIL,
  ANIME_EPISODES_ADD_REQUEST,
  ANIME_EPISODES_ADD_SUCCESS,
  ANIME_EXPLORE_DETAILS_FAIL,
  ANIME_EXPLORE_DETAILS_REQUEST,
  ANIME_EXPLORE_DETAILS_SUCCESS,
  ANIME_SEARCH_CLEAR,
  ANIME_SEARCH_FAIL,
  ANIME_SEARCH_REQUEST,
  ANIME_SEARCH_SUCCESS,
  ANIME_STREAM_DETAILS_FAIL,
  ANIME_STREAM_DETAILS_REQUEST,
  ANIME_STREAM_DETAILS_SUCCESS,
  ANIME_STREAM_EXTERNAL_CLEAR,
  ANIME_STREAM_EXTERNAL_FAIL,
  ANIME_STREAM_EXTERNAL_REQUEST,
  ANIME_STREAM_EXTERNAL_SUCCESS,
  ANIME_STREAM_URL_CLEAR,
  ANIME_STREAM_URL_FAIL,
  ANIME_STREAM_URL_REQUEST,
  ANIME_STREAM_URL_SUCCESS,
  DOWNLOAD_LIBRARY_FAIL,
  DOWNLOAD_LIBRARY_REQUEST,
  DOWNLOAD_LIBRARY_SUCCESS,
} from "../constants/animeConstants";

export const searchAnimeList = (query) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_SEARCH_REQUEST, payload: {} });

    console.log("normal search");

    const { data } = await server.get(`/search?anime=${query}`);
    dispatch({ type: ANIME_SEARCH_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_SEARCH_FAIL, payload: error.response.data });
  }
};

export const addAnimeDetails = (data) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_DETAILS_REQUEST });
    const ep_details = await server.get(data.ep_details);
    dispatch(addEpisodesDetails(ep_details.data));
    dispatch({ type: ANIME_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_DETAILS_FAIL, payload: error });
  }
};

export const addEpisodesDetails = (data) => async (dispatch) => {
  console.log(data);
  try {
    dispatch({ type: ANIME_EPISODES_ADD_REQUEST });

    dispatch({ type: ANIME_EPISODES_ADD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_EPISODES_ADD_FAIL, payload: error });
  }
};
export const addCurrentEp = (data) => async (dispatch) => {
  console.log(data);
  try {
    dispatch({ type: ANIME_CURRENT_EP_REQUEST });

    dispatch({ type: ANIME_CURRENT_EP_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_CURRENT_EP_FAIL, payload: error });
  }
};
export const clearSearch = () => async (dispatch) => {
  // dispatch({ type: ANIME_SEARCH_CLEAR });
};
export const clearEp = () => async (dispatch) => {
  dispatch({ type: ANIME_STREAM_URL_CLEAR });
};

export const getStreamDetails = (stream_detail) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_STREAM_DETAILS_REQUEST });
    const { data } = await server.get(stream_detail);

    console.log(data);
    dispatch({ type: ANIME_STREAM_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ANIME_STREAM_DETAILS_FAIL, payload: error });
  }
};

export const getExploreDetails = (query) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_EXPLORE_DETAILS_REQUEST });
    const { data } = await server.get(`top_anime?type=${query}&limit=0`);

    console.log(data);
    dispatch({ type: ANIME_EXPLORE_DETAILS_SUCCESS, payload: data });
    // dispatch({ type: ANIME_EXPLORE_QUERY, payload: query });
  } catch (error) {
    dispatch({ type: ANIME_EXPLORE_DETAILS_FAIL, payload: error });
  }
};

export const playVideoExternal = (url, player) => async (dispatch) => {
  try {
    console.log(url);
    console.log(player);
    dispatch({ type: ANIME_STREAM_EXTERNAL_REQUEST });
    // console.log(anime_session, ep_session);
    await server.post(
      `/stream`,
      {
        manifest_url: url,
        player: player,
      },
      {
        "Content-Type": "application/json",
      }
    );

    // console.log(data);
    dispatch({ type: ANIME_STREAM_EXTERNAL_SUCCESS });
  } catch (error) {
    console.log(error);

    dispatch({
      type: ANIME_STREAM_EXTERNAL_FAIL,
      payload: error.response.data,
    });

    setTimeout(() => {
      dispatch({
        type: ANIME_STREAM_EXTERNAL_CLEAR,
      });
    }, 3000);
  }
};
export const getVideoUrl = (pahewin_url) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_STREAM_URL_REQUEST });
    // console.log(anime_session, ep_session);
    const { data } = await server.post(
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

export const downloadVideo = (url, file_name) => async (dispatch) => {
  try {
    dispatch({ type: ANIME_DOWNLOAD_REQUEST });
    const { data } = await server.post(
      `/download`,
      {
        manifest_url: url,
        file_name,
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

    const { data } = await server.get(`/library`);
    console.log(data);

    dispatch({ type: DOWNLOAD_LIBRARY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: DOWNLOAD_LIBRARY_FAIL, payload: error });
  }
};
