export interface IComment {
	_id: string;
	username: string;
	text: string;

}

export interface ITrack {
	_id: string;
	name: string;
	artist: string;
	text: string;
	listens: number
	picture: string;
	audio: string;
	album?: string | null;
	// автор загрузки (id пользователя) — для проверки прав в UI
	user?: string | null;
	comments: IComment[]
}

export interface IAlbum {
	_id: string;
	name: string;
	artist: string;
	picture: string;
	user?: string;
	tracks?: ITrack[]
}

export interface ITrackState {
	tracks: ITrack[];
	error: string,

}

export enum TrackActionEnum {
	FETCH_TRACKS = 'FETCH_TRACKS',
	FETCH_TRACKS_ERROR = 'FETCH_TRACKS_ERROR',
}

interface IFetchTracksAction {
	type: TrackActionEnum.FETCH_TRACKS;
	payload: ITrack[];
}


interface IFetchTracksErrorAction {
	type: TrackActionEnum.FETCH_TRACKS_ERROR;
	payload: string;
}

export type TrackAction = IFetchTracksAction | IFetchTracksErrorAction;
