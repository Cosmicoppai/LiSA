import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { animeSearchListReducer, animeStreamDetailsReducer } from './reducers/animeReducers';

const reducer = combineReducers({
  animeSearchList: animeSearchListReducer,
  animeStreamDetails: animeStreamDetailsReducer
});



const middleware = [thunk];
const initialState = {};

const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
