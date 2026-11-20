import { combineReducers } from "redux";
import { playerReducer } from './playerReducer';
import { trackReducer } from './trackReducer';
import { authReducer } from './authReducer';

export const rootReducer = combineReducers({
	player: playerReducer,
	track: trackReducer,
	auth: authReducer
})
