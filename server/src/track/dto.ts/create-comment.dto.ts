import { IsString, IsMongoId, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
	@IsMongoId({ message: 'Некорректный id трека' })
	readonly trackId: string;

	@IsString()
	@IsNotEmpty({ message: 'Введите текст комментария' })
	@MaxLength(1000)
	readonly text: string;
}
