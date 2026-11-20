import request from 'supertest';
import { createTestApp, stopTestApp, TestApp, createUserAndGetToken } from './utils';

describe('Albums (e2e)', () => {
	let testApp: TestApp;
	let ownerToken: string;
	let otherToken: string;
	let albumId: string;
	let trackId: string;

	beforeAll(async () => {
		testApp = await createTestApp();
		ownerToken = await createUserAndGetToken(testApp.http, 'owner@test.dev', 'Owner');
		otherToken = await createUserAndGetToken(testApp.http, 'other@test.dev', 'Other');
	});

	afterAll(async () => {
		await stopTestApp(testApp);
	});

	it('не создаёт альбом без авторизации', async () => {
		const res = await request(testApp.http)
			.post('/albums')
			.field('name', 'No auth')
			.field('artist', 'Nobody');
		expect(res.status).toBe(401);
	});

	it('создаёт альбом с токеном', async () => {
		const res = await request(testApp.http)
			.post('/albums')
			.set('Authorization', `Bearer ${ownerToken}`)
			.field('name', 'E2E Album')
			.field('artist', 'E2E Artist');
		expect(res.status).toBe(201);
		expect(res.body.name).toBe('E2E Album');
		albumId = res.body._id;
	});

	it('отклоняет альбом с пустым названием', async () => {
		const res = await request(testApp.http)
			.post('/albums')
			.set('Authorization', `Bearer ${ownerToken}`)
			.field('name', '')
			.field('artist', 'E2E Artist');
		expect(res.status).toBe(400);
	});

	it('привязывает трек к альбому при создании', async () => {
		const res = await request(testApp.http)
			.post('/tracks')
			.set('Authorization', `Bearer ${ownerToken}`)
			.field('name', 'Album Track')
			.field('artist', 'E2E Artist')
			.field('albumId', albumId);
		expect(res.status).toBe(201);
		expect(res.body.album).toBe(albumId);
		trackId = res.body._id;
	});

	it('показывает треки альбома на странице альбома', async () => {
		const res = await request(testApp.http).get(`/albums/${albumId}`);
		expect(res.status).toBe(200);
		expect(res.body.tracks).toHaveLength(1);
		expect(res.body.tracks[0].name).toBe('Album Track');
	});

	it('отклоняет привязку к несуществующему альбому', async () => {
		const res = await request(testApp.http)
			.post('/tracks')
			.set('Authorization', `Bearer ${ownerToken}`)
			.field('name', 'Orphan')
			.field('artist', 'E2E Artist')
			.field('albumId', '000000000000000000000000');
		expect(res.status).toBe(404);
	});

	it('запрещает удаление чужого альбома (403)', async () => {
		const res = await request(testApp.http)
			.delete(`/albums/${albumId}`)
			.set('Authorization', `Bearer ${otherToken}`);
		expect(res.status).toBe(403);
	});

	it('добавляет и убирает трек в альбоме (только владелец/админ)', async () => {
		const created = await request(testApp.http)
			.post('/tracks')
			.set('Authorization', `Bearer ${ownerToken}`)
			.field('name', 'Standalone Track')
			.field('artist', 'E2E Artist');
		expect(created.status).toBe(201);
		const freeTrackId = created.body._id;

		// чужой пользователь не может менять состав альбома
		const forbidden = await request(testApp.http)
			.post(`/albums/${albumId}/tracks/${freeTrackId}`)
			.set('Authorization', `Bearer ${otherToken}`);
		expect(forbidden.status).toBe(403);

		const res = await request(testApp.http)
			.post(`/albums/${albumId}/tracks/${freeTrackId}`)
			.set('Authorization', `Bearer ${ownerToken}`);
		expect(res.status).toBe(201);
		expect(res.body.tracks.map((t: any) => t.name)).toContain('Standalone Track');

		// убираем трек из альбома — привязка снимается, трек остаётся
		const removed = await request(testApp.http)
			.delete(`/albums/${albumId}/tracks/${freeTrackId}`)
			.set('Authorization', `Bearer ${ownerToken}`);
		expect(removed.status).toBe(200);
		expect(removed.body.tracks.map((t: any) => t.name)).not.toContain('Standalone Track');

		const track = await request(testApp.http).get(`/tracks/${freeTrackId}`);
		expect(track.body.album).toBeNull();
	});

	it('отвязывает треки при удалении альбома владельцем', async () => {
		const res = await request(testApp.http)
			.delete(`/albums/${albumId}`)
			.set('Authorization', `Bearer ${ownerToken}`);
		expect(res.status).toBe(200);

		const track = await request(testApp.http).get(`/tracks/${trackId}`);
		expect(track.status).toBe(200);
		expect(track.body.album).toBeNull();

		const gone = await request(testApp.http).get(`/albums/${albumId}`);
		expect(gone.status).toBe(404);
	});
});
