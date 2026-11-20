import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
export type AlbumDocument = Album & Document;


@Schema()
export class Album {

	@Prop()
	name: string;

	@Prop()
	artist: string;

	@Prop()
	picture: string;

	// пользователь, создавший альбом (для проверки прав на удаление); mongoose приводит строку к ObjectId
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
	user?: string;
}

export const AlbumSchema = SchemaFactory.createForClass(Album)
