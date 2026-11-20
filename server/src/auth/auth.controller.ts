import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth } from './decorators/auth.decorator';
import type { Request } from 'express';

@Controller('/auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('/register')
	register(@Body() dto: RegisterUserDto) {
		return this.authService.register(dto);
	}

	@Post('/login')
	login(@Body() dto: LoginUserDto) {
		return this.authService.login(dto);
	}

	@Get('/me')
	@Auth()
	me(@Req() req: Request) {
		return req.user;
	}
}
