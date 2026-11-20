// Дополняем паспортный тип пользователя данными из JWT-пейлоада
declare global {
	namespace Express {
		interface User {
			userId: string;
			email: string;
			username: string;
			role: 'user' | 'admin';
		}
	}
}

export { };
