import { Module } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AlbumSchema } from './album.schema';
import { TrackSchema } from '../track/schemas/track.schema';
import { FileModule } from '../file/file.module';

@Module({
	imports: [
		PassportModule.register({}),
		MongooseModule.forFeature([
			{ name: 'Album', schema: AlbumSchema },
			{ name: 'Track', schema: TrackSchema },
		]),
		FileModule
	],
	controllers: [AlbumController],
	providers: [AlbumService]
})
export class AlbumModule { }
