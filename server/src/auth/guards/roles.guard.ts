import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) { }

	canActivate(context: ExecutionContext): boolean {
		// роли не заданы — достаточно быть аутентифицированным (проверил JwtAuthGuard)
		const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
		if (!roles || roles.length === 0) {
			return true;
		}
		const { user } = context.switchToHttp().getRequest();
		return roles.includes(user?.role);
	}
}
