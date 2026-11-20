import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {

	@Prop({ unique: true, required: true, lowercase: true, trim: true })
	email: string;

	// хэш пароля; select: false — не отдаём наружу без явного запроса
	@Prop({ required: true, select: false })
	password: string;

	@Prop({ required: true, trim: true })
	username: string;

	@Prop({ enum: ['user', 'admin'], default: 'user' })
	role: 'user' | 'admin';
}

export const UserSchema = SchemaFactory.createForClass(User)
