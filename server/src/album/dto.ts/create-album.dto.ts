import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAlbumDto {
	@IsString()
	@IsNotEmpty({ message: 'Введите название альбома' })
	@MaxLength(100)
	readonly name: string;

	@IsString()
	@IsNotEmpty({ message: 'Введите имя исполнителя' })
	@MaxLength(100)
	readonly artist: string;
}
