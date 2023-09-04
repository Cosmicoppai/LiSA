import server from "../axios";
import {
    ANIME_CURRENT_EP_FAIL,
    ANIME_CURRENT_EP_REQUEST,
    ANIME_CURRENT_EP_SUCCESS,
    ANIME_DETAILS_FAIL,
    ANIME_DETAILS_REQUEST,
    ANIME_DETAILS_SUCCESS,
    ANIME_EPISODES_ADD_FAIL,
    ANIME_EPISODES_ADD_REQUEST,
    ANIME_EPISODES_ADD_SUCCESS,
    ANIME_EXPLORE_DETAILS_FAIL,
    ANIME_EXPLORE_DETAILS_REQUEST,
    ANIME_EXPLORE_DETAILS_SUCCESS,
    ANIME_RECOMMENDATION_FAIL,
    ANIME_RECOMMENDATION_REQUEST,
    ANIME_RECOMMENDATION_SUCCESS,
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

        const { data } = await server.get(`/search?type=anime&query=${query}`);
        dispatch({ type: ANIME_SEARCH_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: ANIME_SEARCH_FAIL, payload: error.response.data });
    }
};

export const addAnimeDetails = (data) => async (dispatch) => {
    try {
        let url;
        let ep_details;
        dispatch({ type: ANIME_DETAILS_REQUEST });
        dispatch({ type: ANIME_DETAILS_SUCCESS, payload: data });
        dispatch({ type: ANIME_EPISODES_ADD_REQUEST, payload: data });

        if (data.anime_detail) {
            // dispatch({ type: ANIME_EPISODES_ADD_REQUEST });

            const searchRes = await server.get(data.anime_detail);

            ep_details = await server.get(searchRes.data[0].ep_details);
            dispatch({
                type: ANIME_DETAILS_SUCCESS,
                payload: { ...data, ...ep_details.data },
            });
        } else {
            dispatch({ type: ANIME_DETAILS_SUCCESS, payload: data });

            ep_details = await server.get(data.ep_details);
        }

        dispatch(addEpisodesDetails(ep_details.data));
    } catch (error) {
        dispatch({ type: ANIME_DETAILS_FAIL, payload: error });
    }
};

export const addEpisodesDetails = (data) => async (dispatch, getState) => {
    try {
        dispatch({ type: ANIME_EPISODES_ADD_REQUEST });
        let { details } = getState().animeEpisodesDetails;
        let allDetails;
        if (details) {
            allDetails = { ...details, ...data };
        } else {
            allDetails = data;
        }
        dispatch({ type: ANIME_EPISODES_ADD_SUCCESS, payload: allDetails });
    } catch (error) {
        dispatch({ type: ANIME_EPISODES_ADD_FAIL, payload: error });
    }
};
export const addCurrentEp = (data) => async (dispatch) => {
    try {
        dispatch({ type: ANIME_CURRENT_EP_REQUEST });

        dispatch({ type: ANIME_CURRENT_EP_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: ANIME_CURRENT_EP_FAIL, payload: error });
    }
};
export const clearSearch = () => async (dispatch) => {
    dispatch({ type: ANIME_SEARCH_CLEAR });
};
export const clearEp = () => async (dispatch) => {
    dispatch({ type: ANIME_STREAM_URL_CLEAR });
};

export const getStreamDetails = (stream_detail) => async (dispatch) => {
    try {
        dispatch({ type: ANIME_STREAM_DETAILS_REQUEST });
        const { data } = await server.get(stream_detail);

        dispatch({ type: ANIME_STREAM_DETAILS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: ANIME_STREAM_DETAILS_FAIL, payload: error });
    }
};

export const getExploreDetails = (query) => async (dispatch) => {
    try {
        dispatch({ type: ANIME_EXPLORE_DETAILS_REQUEST });
        const { data } = await server.get(`top_anime?type=${query}&limit=0`);

        dispatch({ type: ANIME_EXPLORE_DETAILS_SUCCESS, payload: data });
        // dispatch({ type: ANIME_EXPLORE_QUERY, payload: query });
    } catch (error) {
        dispatch({ type: ANIME_EXPLORE_DETAILS_FAIL, payload: error });
    }
};

export const playVideoExternal = (payload) => async (dispatch) => {
    try {
        dispatch({ type: ANIME_STREAM_EXTERNAL_REQUEST });
        await server.post(`/stream`, payload, {
            "Content-Type": "application/json",
        });

        dispatch({ type: ANIME_STREAM_EXTERNAL_SUCCESS });
    } catch (error) {
        dispatch({
            type: ANIME_STREAM_EXTERNAL_FAIL,
            payload: error.response.data,
        });

        setTimeout(() => {
            dispatch({
                type: ANIME_STREAM_EXTERNAL_CLEAR,
            });
        }, 3000);
        throw new Error(error);
    }
};
export const getVideoUrl = (pahewin_url) => async (dispatch) => {
    try {
        dispatch({ type: ANIME_STREAM_URL_REQUEST });
        const { data } = await server.post(
            `/get_video_url`,
            {
                pahewin_url,
            },
            {
                "Content-Type": "application/json",
            }
        );

        dispatch({ type: ANIME_STREAM_URL_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: ANIME_STREAM_URL_FAIL, payload: error });
    }
};
export const cancelLiveDownload = async (id) => {
    try {
        const { data } = await server.post(
            `/download/cancel`,
            {
                id: [id],
            },
            {
                "Content-Type": "application/json",
            }
        );
    } catch (error) {
        console.log(error);
    }
};
export const pauseLiveDownload = async (id) => {
    try {
        const { data } = await server.post(
            `/download/pause`,
            {
                id: [id],
            },
            {
                "Content-Type": "application/json",
            }
        );
    } catch (error) {
        console.log(error);
    }
};
export const resumeLiveDownload = async (id) => {
    try {
        const { data } = await server.post(
            `/download/resume`,
            {
                id: [id],
            },
            {
                "Content-Type": "application/json",
            }
        );
    } catch (error) {
        console.log(error);
    }
};

export const getDownloadHistory = () => async (dispatch) => {
    try {
        dispatch({ type: DOWNLOAD_LIBRARY_REQUEST });

        const { data } = await server.get(`/library`);

        dispatch({ type: DOWNLOAD_LIBRARY_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: DOWNLOAD_LIBRARY_FAIL, payload: error });
    }
};
export const getRecommendations = (url) => async (dispatch) => {
    try {
        dispatch({ type: ANIME_RECOMMENDATION_REQUEST });

        const { data } = await server.get(url);

        dispatch({ type: ANIME_RECOMMENDATION_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: ANIME_RECOMMENDATION_FAIL, payload: error });
    }
};
