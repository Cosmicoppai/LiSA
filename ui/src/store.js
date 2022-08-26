import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  animeCurrentEpReducer,
  animeDetailsReducer,
  animeDownloadReducer,
  animeEpisodesReducer,
  animeEpUrlReducer,
  animeExploreDetailsReducer,
  animeSearchListReducer,
  animeStreamDetailsReducer,
  animeStreamExternalReducer,
} from "./reducers/animeReducers";

const reducer = combineReducers({
  animeSearchList: animeSearchListReducer,
  animeStreamDetails: animeStreamDetailsReducer,
  animeStreamExternal: animeStreamExternalReducer,
  animeDownloadDetails: animeDownloadReducer,
  animeEpisodesDetails: animeEpisodesReducer,
  animeCurrentEp: animeCurrentEpReducer,
  animeEpUrl: animeEpUrlReducer,
  animeExploreDetails: animeExploreDetailsReducer,
  animeDetails: animeDetailsReducer,
});

const middleware = [thunk];
const initialState = {};

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
