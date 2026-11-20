import { TrackAction, TrackActionEnum } from '@/types/track';
import type { ThunkAction } from 'redux-thunk';
import type { RootState } from '@/store';
import { api, apiError } from '@/lib/api';

export const fetchTracks = (): ThunkAction<void, RootState, unknown, TrackAction> =>
	async (dispatch) => {
		try {
			const res = await api('/tracks');
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			const tracks = await res.json();
			dispatch({ type: TrackActionEnum.FETCH_TRACKS, payload: tracks });
		} catch (error) {
			dispatch({ type: TrackActionEnum.FETCH_TRACKS_ERROR, payload: (error as Error).message });
		}
	};

export const searchTracks = (query: string): ThunkAction<void, RootState, unknown, TrackAction> =>
	async (dispatch) => {
		try {
			const res = await api(`/tracks/search?query=${encodeURIComponent(query)}`);
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			const tracks = await res.json();
			dispatch({ type: TrackActionEnum.FETCH_TRACKS, payload: tracks });
		} catch (error) {
			dispatch({ type: TrackActionEnum.FETCH_TRACKS_ERROR, payload: (error as Error).message });
		}
	};

export const deleteTrack = (_id: string): ThunkAction<void, RootState, unknown, TrackAction> =>
	async (dispatch, getState) => {
		try {
			const res = await api(`/tracks/${_id}`, { method: 'DELETE' });
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			const tracks = getState().track.tracks.filter(track => track._id !== _id);
			dispatch({ type: TrackActionEnum.FETCH_TRACKS, payload: tracks });
		} catch (error) {
			dispatch({ type: TrackActionEnum.FETCH_TRACKS_ERROR, payload: (error as Error).message });
		}
	};
