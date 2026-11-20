import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { TrackSchema } from './schemas/track.schema';
import { CommentSchema } from './schemas/comment.shema';
import { AlbumSchema } from '../album/album.schema';
import { FileModule } from '../file/file.module';

@Module({
	imports: [
		PassportModule.register({}),
		MongooseModule.forFeature([
			{ name: 'Track', schema: TrackSchema },
			{ name: 'Comment', schema: CommentSchema },
			{ name: 'Album', schema: AlbumSchema },
		]),
		FileModule
	],
	controllers: [TrackController],
	providers: [TrackService]
})
export class TrackModule { }
