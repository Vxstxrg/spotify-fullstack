import { API_URL } from '@/const/api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const getToken = (): string => {
	if (typeof window === 'undefined') return '';
	return localStorage.getItem(TOKEN_KEY) ?? '';
};

export const setAuthStorage = (token: string, user: unknown) => {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCachedUser = (): unknown => {
	if (typeof window === 'undefined') return null;
	try {
		return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
	} catch {
		return null;
	}
};

export const clearAuthStorage = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

/**
 * fetch к API с JWT-токеном из localStorage.
 * При 401 чистит сессию и отправляет на страницу входа.
 */
export async function api(path: string, options: RequestInit = {}): Promise<Response> {
	const isFormData = options.body instanceof FormData;
	const headers: Record<string, string> = {};
	if (!isFormData && options.body) {
		headers['Content-Type'] = 'application/json';
	}
	const token = getToken();
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const res = await fetch(`${API_URL}${path}`, { ...options, headers });

	if (res.status === 401 && typeof window !== 'undefined') {
		clearAuthStorage();
		if (!window.location.pathname.startsWith('/login')) {
			window.location.assign('/login');
		}
	}
	return res;
}

// достаём человекочитаемое сообщение об ошибке из ответа Nest
export async function apiError(res: Response): Promise<string> {
	try {
		const data = await res.json();
		if (data?.message) {
			return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
		}
	} catch {
		// тело ответа не JSON
	}
	return `Ошибка запроса (${res.status})`;
}
