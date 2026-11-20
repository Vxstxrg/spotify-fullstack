import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TrackModule } from './track/track.module';
import { AlbumModule } from './album/album.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';


@Module({
	imports: [
		ServeStaticModule.forRoot({
			// Статика (обложки/аудио) лежит в server/static и переживает пересборки
			rootPath: path.resolve(process.cwd(), 'static'),
		}),
		MongooseModule.forRootAsync({
			useFactory: () => ({
				uri: process.env.MONGODB_URI,
			}),
		}),
		TrackModule,
		AlbumModule,
		AuthModule,
		FileModule,
	],
	providers: [
		// глобальная валидация DTO: неизвестные поля отбрасываются, типы приводятся
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({ whitelist: true, transform: true }),
		},
	],
})
export class AppModule { }
