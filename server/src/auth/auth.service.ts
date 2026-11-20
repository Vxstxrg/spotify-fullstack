import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

export type AuthUser = Omit<User, 'password'> & { _id: string };
export interface AuthResponse { token: string; user: AuthUser }

@Injectable()
export class AuthService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		private readonly jwtService: JwtService
	) { }

	async register(dto: RegisterUserDto): Promise<AuthResponse> {
		const exists = await this.userModel.findOne({ email: dto.email });
		if (exists) {
			throw new BadRequestException('Пользователь с таким email уже зарегистрирован');
		}

		// первый зарегистрированный пользователь получает роль администратора
		const isFirstUser = (await this.userModel.countDocuments()) === 0;
		const password = await bcrypt.hash(dto.password, 10);

		const user = await this.userModel.create({
			...dto,
			password,
			role: isFirstUser ? 'admin' : 'user',
		});

		return this.buildAuthResponse(user);
	}

	async login(dto: LoginUserDto): Promise<AuthResponse> {
		const user = await this.userModel.findOne({ email: dto.email }).select('+password');
		if (!user || !(await bcrypt.compare(dto.password, user.password))) {
			throw new UnauthorizedException('Некорректный email или пароль');
		}
		return this.buildAuthResponse(user);
	}

	private buildAuthResponse(user: UserDocument): AuthResponse {
		const token = this.jwtService.sign({
			sub: user._id,
			email: user.email,
			username: user.username,
			role: user.role,
		});
		const safeUser = user.toObject();
		delete safeUser.password;
		return { token, user: safeUser as AuthUser };
	}
}
