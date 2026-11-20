export interface IUser {
	_id: string;
	email: string;
	username: string;
	role: 'user' | 'admin';
}

export interface IAuthState {
	isAuth: boolean;
	user: IUser | null;
	error: string;
}

export enum AuthActionEnum {
	SET_AUTH = 'SET_AUTH',
	LOGOUT = 'LOGOUT',
	AUTH_ERROR = 'AUTH_ERROR',
}

export interface ISetAuthAction {
	type: AuthActionEnum.SET_AUTH;
	payload: IUser;
}

export interface ILogoutAction {
	type: AuthActionEnum.LOGOUT;
}

export interface IAuthErrorAction {
	type: AuthActionEnum.AUTH_ERROR;
	payload: string;
}

export type AuthAction = ISetAuthAction | ILogoutAction | IAuthErrorAction;
