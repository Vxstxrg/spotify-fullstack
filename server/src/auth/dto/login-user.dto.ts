import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
	@IsEmail({}, { message: 'Некорректный email' })
	readonly email: string;

	@IsString()
	@IsNotEmpty({ message: 'Введите пароль' })
	readonly password: string;
}
