import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import {
    animeCurrentEpReducer,
    animeDetailsReducer,
    animeEpisodesReducer,
    animeStreamDetailsReducer,
    animeStreamExternalReducer,
} from './reducers/animeReducers';

const reducer = combineReducers({
    animeStreamDetails: animeStreamDetailsReducer,
    animeStreamExternal: animeStreamExternalReducer,
    animeEpisodesDetails: animeEpisodesReducer,
    animeCurrentEp: animeCurrentEpReducer,

    animeDetails: animeDetailsReducer,
});

const middleware = [thunk];
const initialState = {};

const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware)),
);

export default store;
