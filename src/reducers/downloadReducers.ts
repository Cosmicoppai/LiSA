import {
  DOWNLOAD_LIBRARY_FAIL,
  DOWNLOAD_LIBRARY_REQUEST,
  DOWNLOAD_LIBRARY_SUCCESS,
} from "../constants/animeConstants";
import {
  ANIME_DOWNLOAD_FAIL,
  ANIME_DOWNLOAD_REQUEST,
  ANIME_DOWNLOAD_SUCCESS,
} from "../constants/downloadConstants";

export const animeDownloadReducer = (state = { loading: false, details: null }, action) => {
  switch (action.type) {
    case ANIME_DOWNLOAD_REQUEST:
      return {
        loading: true,
        details: null,
      };

    case ANIME_DOWNLOAD_SUCCESS:
      return { loading: false, details: action.payload };

    case ANIME_DOWNLOAD_FAIL:
      return { loading: false, error: action.payload };

    default:
      return state;
  }
};
export const animeLibraryReducer = (
  state = { loading: false, details: null },
  action
) => {
  switch (action.type) {
    case DOWNLOAD_LIBRARY_REQUEST:
      return {
        loading: true,
        details: null,
      };

    case DOWNLOAD_LIBRARY_SUCCESS:
      return { loading: false, details: action.payload };

    case DOWNLOAD_LIBRARY_FAIL:
      return { loading: false, error: action.payload };

    default:
      return state;
  }
};
export const liveDownloads = (
  state = { loading: false, details: null },
  action
) => {
  switch (action.type) {
    case DOWNLOAD_LIBRARY_REQUEST:
      return {
        loading: true,
        details: null,
      };

    case DOWNLOAD_LIBRARY_SUCCESS:
      return { loading: false, details: action.payload };

    case DOWNLOAD_LIBRARY_FAIL:
      return { loading: false, error: action.payload };

    default:
      return state;
  }
};
