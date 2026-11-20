import { AuthAction, AuthActionEnum, IUser } from '@/types/auth';
import type { ThunkAction } from 'redux-thunk';
import type { RootState } from '@/store';
import { api, apiError, clearAuthStorage, getCachedUser, getToken, setAuthStorage } from '@/lib/api';

type AuthThunk = ThunkAction<Promise<boolean>, RootState, unknown, AuthAction>;

export const login = (email: string, password: string): AuthThunk =>
	async (dispatch) => {
		try {
			const res = await api('/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});
			if (!res.ok) {
				dispatch({ type: AuthActionEnum.AUTH_ERROR, payload: await apiError(res) });
				return false;
			}
			const data = await res.json();
			setAuthStorage(data.token, data.user);
			dispatch({ type: AuthActionEnum.SET_AUTH, payload: data.user });
			return true;
		} catch (e) {
			dispatch({ type: AuthActionEnum.AUTH_ERROR, payload: (e as Error).message });
			return false;
		}
	};

export const register = (email: string, password: string, username: string): AuthThunk =>
	async (dispatch) => {
		try {
			const res = await api('/auth/register', {
				method: 'POST',
				body: JSON.stringify({ email, password, username })
			});
			if (!res.ok) {
				dispatch({ type: AuthActionEnum.AUTH_ERROR, payload: await apiError(res) });
				return false;
			}
			const data = await res.json();
			setAuthStorage(data.token, data.user);
			dispatch({ type: AuthActionEnum.SET_AUTH, payload: data.user });
			return true;
		} catch (e) {
			dispatch({ type: AuthActionEnum.AUTH_ERROR, payload: (e as Error).message });
			return false;
		}
	};

// восстанавливает сессию при загрузке приложения: сначала из кэша, затем проверяет токен
export const checkAuth = (): AuthThunk =>
	async (dispatch) => {
		if (!getToken()) return false;

		const cached = getCachedUser() as IUser | null;
		if (cached) {
			dispatch({ type: AuthActionEnum.SET_AUTH, payload: cached });
		}

		try {
			// намеренно без api(): протухший токен не должен перебрасывать на /login
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/me`, {
				headers: { Authorization: `Bearer ${getToken()}` }
			});
			if (!res.ok) {
				clearAuthStorage();
				dispatch({ type: AuthActionEnum.LOGOUT });
				return false;
			}
			const { userId, email, username, role } = await res.json();
			const user: IUser = { _id: userId, email, username, role };
			setAuthStorage(getToken(), user);
			dispatch({ type: AuthActionEnum.SET_AUTH, payload: user });
			return true;
		} catch {
			return false;
		}
	};

export const logout = (): AuthAction => {
	clearAuthStorage();
	return { type: AuthActionEnum.LOGOUT };
};
