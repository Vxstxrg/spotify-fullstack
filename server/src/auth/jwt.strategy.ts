import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
	sub: string;
	email: string;
	username: string;
	role: 'user' | 'admin';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET || 'spotify-dev-secret-change-me',
		});
	}

	async validate(payload: JwtPayload) {
		if (!payload?.sub) {
			throw new UnauthorizedException();
		}
		return { userId: payload.sub, email: payload.email, username: payload.username, role: payload.role };
	}
}
