import request from 'supertest';
import { createTestApp, stopTestApp, TestApp, registerUser } from './utils';

describe('Auth (e2e)', () => {
	let testApp: TestApp;

	beforeAll(async () => {
		testApp = await createTestApp();
	});

	afterAll(async () => {
		await stopTestApp(testApp);
	});

	it('регистрирует первого пользователя как администратора', async () => {
		const res = await registerUser(testApp.http, 'admin@test.dev', 'Admin');
		expect(res.status).toBe(201);
		expect(res.body.token).toBeDefined();
		expect(res.body.user.role).toBe('admin');
		expect(res.body.user.password).toBeUndefined();
	});

	it('регистрирует последующих пользователей с ролью user', async () => {
		const res = await registerUser(testApp.http, 'user@test.dev', 'PlainUser');
		expect(res.status).toBe(201);
		expect(res.body.user.role).toBe('user');
	});

	it('не регистрирует повторно тот же email', async () => {
		const res = await registerUser(testApp.http, 'admin@test.dev', 'Duplicate');
		expect(res.status).toBe(400);
	});

	it('отклоняет некорректный email', async () => {
		const res = await registerUser(testApp.http, 'not-an-email', 'Bad');
		expect(res.status).toBe(400);
	});

	it('отклоняет короткий пароль', async () => {
		const res = await request(testApp.http)
			.post('/auth/register')
			.send({ email: 'short@test.dev', password: '123', username: 'Short' });
		expect(res.status).toBe(400);
	});

	it('логинит с корректным паролем и возвращает токен', async () => {
		const res = await request(testApp.http)
			.post('/auth/login')
			.send({ email: 'admin@test.dev', password: 'secret123' });
		expect(res.status).toBe(201);
		expect(res.body.token).toBeDefined();
		expect(res.body.user.email).toBe('admin@test.dev');
	});

	it('не логинит с неверным паролем', async () => {
		const res = await request(testApp.http)
			.post('/auth/login')
			.send({ email: 'admin@test.dev', password: 'wrong-password' });
		expect(res.status).toBe(401);
	});

	it('не пускает /auth/me без токена', async () => {
		const res = await request(testApp.http).get('/auth/me');
		expect(res.status).toBe(401);
	});

	it('возвращает данные пользователя по /auth/me с токеном', async () => {
		const login = await request(testApp.http)
			.post('/auth/login')
			.send({ email: 'admin@test.dev', password: 'secret123' });

		const res = await request(testApp.http)
			.get('/auth/me')
			.set('Authorization', `Bearer ${login.body.token}`);

		expect(res.status).toBe(200);
		expect(res.body.email).toBe('admin@test.dev');
		expect(res.body.role).toBe('admin');
	});
});
