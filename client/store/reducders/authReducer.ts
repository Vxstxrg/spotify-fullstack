import { AuthAction, AuthActionEnum, IAuthState } from '@/types/auth'

const initialState: IAuthState = {
	isAuth: false,
	user: null,
	error: ''
}

export const authReducer = (state = initialState, action: AuthAction): IAuthState => {
	switch (action.type) {
		case AuthActionEnum.SET_AUTH:
			return {
				isAuth: true, user: action.payload, error: ''
			}
		case AuthActionEnum.LOGOUT:
			return {
				isAuth: false, user: null, error: ''
			}
		case AuthActionEnum.AUTH_ERROR:
			return {
				...state, error: action.payload
			}
		default:
			return state
	}
}
