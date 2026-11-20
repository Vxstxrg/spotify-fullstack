import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

export interface TestApp {
	app: any;
	http: any;
	mongo: MongoMemoryServer;
}

// Поднимает приложение на in-memory MongoDB: тесты не трогают реальную базу
export async function createTestApp(): Promise<TestApp> {
	process.env.JWT_SECRET = 'test-jwt-secret';
	const mongo = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongo.getUri('spotify-test');

	const app = await NestFactory.create(AppModule);
	await app.init();

	return { app, http: app.getHttpServer(), mongo };
}

export async function stopTestApp(testApp: TestApp) {
	await testApp.app.close();
	await testApp.mongo.stop();
}

export function registerUser(http: any, email: string, username: string) {
	return request(http)
		.post('/auth/register')
		.send({ email, password: 'secret123', username });
}

export async function createUserAndGetToken(http: any, email: string, username: string): Promise<string> {
	const res = await registerUser(http, email, username);
	return res.body.token as string;
}

export function authPost(http: any, url: string, token: string) {
	return request(http).post(url).set('Authorization', `Bearer ${token}`);
}
