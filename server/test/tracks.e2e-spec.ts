import request from 'supertest';
import { createTestApp, stopTestApp, TestApp, createUserAndGetToken, authPost } from './utils';

describe('Tracks (e2e)', () => {
	let testApp: TestApp;
	let ownerToken: string;
	let otherToken: string;
	let trackId: string;

	beforeAll(async () => {
		testApp = await createTestApp();
		ownerToken = await createUserAndGetToken(testApp.http, 'owner@test.dev', 'Owner');
		otherToken = await createUserAndGetToken(testApp.http, 'other@test.dev', 'Other');
	});

	afterAll(async () => {
		await stopTestApp(testApp);
	});

	it('не создаёт трек без авторизации', async () => {
		const res = await request(testApp.http)
			.post('/tracks')
			.field('name', 'No auth')
			.field('artist', 'Nobody');
		expect(res.status).toBe(401);
	});

	it('создаёт трек с токеном', async () => {
		const res = await authPost(testApp.http, '/tracks', ownerToken)
			.field('name', 'E2E Track')
			.field('artist', 'E2E Artist')
			.field('text', 'some lyrics');
		expect(res.status).toBe(201);
		expect(res.body.name).toBe('E2E Track');
		expect(res.body.listens).toBe(0);
		expect(res.body.audio).toBe('');
		trackId = res.body._id;
	});

	it('отклоняет трек с пустым названием', async () => {
		const res = await authPost(testApp.http, '/tracks', ownerToken)
			.field('name', '')
			.field('artist', 'E2E Artist');
		expect(res.status).toBe(400);
	});

	it('возвращает созданный трек в списке', async () => {
		const res = await request(testApp.http).get('/tracks');
		expect(res.status).toBe(200);
		expect(res.body.some((t: any) => t._id === trackId)).toBe(true);
	});

	it('ищет трек по исполнителю', async () => {
		const res = await request(testApp.http).get('/tracks/search?query=E2E%20Artist');
		expect(res.status).toBe(200);
		expect(res.body.length).toBeGreaterThanOrEqual(1);
		expect(res.body[0].name).toBe('E2E Track');
	});

	it('отдаёт 404 на несуществующий id', async () => {
		const res = await request(testApp.http).get('/tracks/000000000000000000000000');
		expect(res.status).toBe(404);
	});

	it('принимает комментарий только с токеном и берёт имя из аккаунта', async () => {
		const noAuth = await request(testApp.http)
			.post('/tracks/comment')
			.send({ trackId, text: 'guest comment' });
		expect(noAuth.status).toBe(401);

		const res = await authPost(testApp.http, '/tracks/comment', ownerToken)
			.send({ trackId, text: 'great song!' });
		expect(res.status).toBe(201);
		expect(res.body.username).toBe('Owner');
		expect(res.body.text).toBe('great song!');
	});

	it('возвращает трек с комментариями по id', async () => {
		const res = await request(testApp.http).get(`/tracks/${trackId}`);
		expect(res.status).toBe(200);
		expect(res.body.comments).toHaveLength(1);
		expect(res.body.comments[0].username).toBe('Owner');
	});

	it('увеличивает счётчик прослушиваний', async () => {
		const before = (await request(testApp.http).get(`/tracks/${trackId}`)).body.listens;
		const res = await request(testApp.http).post(`/tracks/listen/${trackId}`);
		expect(res.status).toBe(201);
		expect(res.body.listens).toBe(before + 1);
	});

	it('запрещает удаление чужого трека (403)', async () => {
		const res = await request(testApp.http)
			.delete(`/tracks/${trackId}`)
			.set('Authorization', `Bearer ${otherToken}`);
		expect(res.status).toBe(403);
	});

	it('позволяет владельцу удалить свой трек', async () => {
		const res = await request(testApp.http)
			.delete(`/tracks/${trackId}`)
			.set('Authorization', `Bearer ${ownerToken}`);
		expect(res.status).toBe(200);

		const gone = await request(testApp.http).get(`/tracks/${trackId}`);
		expect(gone.status).toBe(404);
	});
});
