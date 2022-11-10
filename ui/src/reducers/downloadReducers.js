import { DOWNLOAD_LIBRARY_FAIL, DOWNLOAD_LIBRARY_REQUEST, DOWNLOAD_LIBRARY_SUCCESS } from "../constants/animeConstants";

export const animeDownloadReducer = (state = { details: null }, action) => {
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