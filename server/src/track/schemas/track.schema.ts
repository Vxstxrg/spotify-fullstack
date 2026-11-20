import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Comment } from './comment.shema';
export type TrackDocument = Track & Document;


@Schema()
export class Track {

	@Prop()
	name: string;

	@Prop()
	artist: string;

	@Prop()
	text: string;

	@Prop()
	listens: number;

	@Prop()
	picture: string;

	@Prop()
	audio: string;

	// альбом, к которому относится трек (может отсутствовать); mongoose приводит строку к ObjectId
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Album' })
	album?: string | null;

	// пользователь, загрузивший трек (для проверки прав на удаление)
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
	user?: string;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
	comments: Comment[]


}

export const TrackSchema = SchemaFactory.createForClass(Track)
