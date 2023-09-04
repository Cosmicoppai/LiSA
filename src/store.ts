import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
    animeCurrentEpReducer,
    animeDetailsReducer,
    animeEpisodesReducer,
    animeEpUrlReducer,
    animeExploreDetailsReducer,
    animeSearchListReducer,
    animeStreamDetailsReducer,
    animeStreamExternalReducer,
    recommendationsReducer,
} from "./reducers/animeReducers";
import { animeDownloadReducer, animeLibraryReducer } from "./reducers/downloadReducers";

const reducer = combineReducers({
    animeSearchList: animeSearchListReducer,
    animeStreamDetails: animeStreamDetailsReducer,
    animeStreamExternal: animeStreamExternalReducer,
    animeDownloadDetails: animeDownloadReducer,
    animeLibraryDetails: animeLibraryReducer,
    animeEpisodesDetails: animeEpisodesReducer,
    animeCurrentEp: animeCurrentEpReducer,
    animeEpUrl: animeEpUrlReducer,
    animeExploreDetails: animeExploreDetailsReducer,
    animeDetails: animeDetailsReducer,
    animeRecommendations: recommendationsReducer,
});

const middleware = [thunk];
const initialState = {};

const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
