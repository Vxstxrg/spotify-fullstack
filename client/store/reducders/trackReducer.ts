import { ITrackState, TrackAction, TrackActionEnum } from '@/types/track'

const initialState: ITrackState = {
	tracks: [],
	error: ''
}


export const trackReducer = (state = initialState, action: TrackAction): ITrackState => {
	switch (action.type) {
		case TrackActionEnum.FETCH_TRACKS_ERROR:
			return {
				...state, error: action.payload
			}
		case TrackActionEnum.FETCH_TRACKS:
			return {
				error: '', tracks: action.payload
			}
		default:
			return state
	}

}
