import { PlayerAction, PlayerActionTypes } from '@/types/player';
import { ITrack } from '@/types/track'; // Проверьте правильность пути к ITrack

export const playTrack = (): PlayerAction => ({
	type: PlayerActionTypes.PLAY
});

export const pauseTrack = (): PlayerAction => ({
	type: PlayerActionTypes.PAUSE
});

export const setActiveTrack = (payload: ITrack): PlayerAction => ({
	type: PlayerActionTypes.SET_ACTIVE,
	payload
});

export const setDuration = (payload: number): PlayerAction => ({
	type: PlayerActionTypes.SET_DURATION,
	payload
});

export const setCurrentTime = (payload: number): PlayerAction => ({
	type: PlayerActionTypes.SET_CURRENT_TIME,
	payload
});

export const setVolume = (payload: number): PlayerAction => ({
	type: PlayerActionTypes.SET_VOLUME,
	payload
});
