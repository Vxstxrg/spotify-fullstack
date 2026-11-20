import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
	@IsEmail({}, { message: 'Некорректный email' })
	readonly email: string;

	@IsString()
	@MinLength(6, { message: 'Пароль должен быть не короче 6 символов' })
	@MaxLength(64)
	readonly password: string;

	@IsString()
	@MinLength(2, { message: 'Имя должно быть не короче 2 символов' })
	@MaxLength(32)
	readonly username: string;
}
