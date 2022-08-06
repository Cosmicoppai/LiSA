import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  animeDownloadReducer,
  animeEpisodeReducer,
  animeEpUrlReducer,
  animeExploreDetailsReducer,
  animeSearchListReducer,
  animeStreamDetailsReducer,
} from "./reducers/animeReducers";

const reducer = combineReducers({
  animeSearchList: animeSearchListReducer,
  animeStreamDetails: animeStreamDetailsReducer,
  animeDownloadDetails: animeDownloadReducer,
  animeEpisodeDetails: animeEpisodeReducer,
  animeEpUrl: animeEpUrlReducer,
  animeExploreDetails: animeExploreDetailsReducer,
});

const middleware = [thunk];
const initialState = {};

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
