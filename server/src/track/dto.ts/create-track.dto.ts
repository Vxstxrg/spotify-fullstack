import { IsOptional, IsString, IsMongoId, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateTrackDto {
	@IsString()
	@IsNotEmpty({ message: 'Введите название трека' })
	@MaxLength(100)
	readonly name: string;

	@IsString()
	@IsNotEmpty({ message: 'Введите имя исполнителя' })
	@MaxLength(100)
	readonly artist: string;

	@IsOptional()
	@IsString()
	@MaxLength(5000)
	readonly text: string;

	@IsOptional()
	@IsMongoId({ message: 'Некорректный id альбома' })
	readonly albumId?: string;
}
