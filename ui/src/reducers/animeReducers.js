import {
  ANIME_SEARCH_CLEAR,
  ANIME_SEARCH_FAIL,
  ANIME_SEARCH_REQUEST,
  ANIME_SEARCH_SUCCESS,
  ANIME_STREAM_CLEAR,
  ANIME_STREAM_DETAILS_CLEAR,
  ANIME_STREAM_DETAILS_FAIL,
  ANIME_STREAM_DETAILS_REQUEST,
  ANIME_STREAM_DETAILS_SUCCESS,
  ANIME_STREAM_FAIL,
  ANIME_STREAM_REQUEST,
  ANIME_STREAM_SUCCESS,
} from "../constants/animeConstants";

export const animeSearchListReducer = (state = { animes: null }, action) => {
  switch (action.type) {
    case ANIME_SEARCH_REQUEST:
      return {
        loading: true,
        animes: [],
      };

    case ANIME_SEARCH_SUCCESS:
      return { loading: false, animes: action.payload };

    case ANIME_SEARCH_FAIL:
      return { loading: false, error: action.payload };
    case ANIME_SEARCH_CLEAR:
      return { loading: false, animes: null };

    default:
      return state;
  }
};

export const animeStreamDetailsReducer = (
  state = { details: null },
  action
) => {
  switch (action.type) {
    case ANIME_STREAM_DETAILS_REQUEST:
      return {
        loading: true,
        details: null,
      };

    case ANIME_STREAM_DETAILS_SUCCESS:
      return { loading: false, details: action.payload };

    case ANIME_STREAM_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    case ANIME_STREAM_DETAILS_CLEAR:
      return { loading: false, details: null };

    default:
      return state;
  }
};
export const animeStreamReducer = (
  state = { details: null },
  action
) => {
  switch (action.type) {
    case ANIME_STREAM_REQUEST:
      return {
        loading: true,
        details: null,
      };

    case ANIME_STREAM_SUCCESS:
      return { loading: false, details: action.payload };

    case ANIME_STREAM_FAIL:
      return { loading: false, error: action.payload };
    case ANIME_STREAM_CLEAR:
      return { loading: false, details: null };

    default:
      return state;
  }
};
