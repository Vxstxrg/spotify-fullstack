import './env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const start = async () => {
	try {
		const PORT = Number(process.env.PORT) || 5000;
		const app = await NestFactory.create(AppModule);
		app.enableCors();
		// 0.0.0.0 — чтобы сервер был доступен из docker-контейнера
		await app.listen(PORT, '0.0.0.0', () => console.log(`server started on PORT ${PORT}`));
	} catch (error) {
		console.error(error);
	}
};

start();
