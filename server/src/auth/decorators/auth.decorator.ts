import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

/**
 * @Auth() — требует аутентификации;
 * @Auth('admin') — требует указанные роли.
 */
export const Auth = (...roles: Array<'user' | 'admin'>) =>
	applyDecorators(
		SetMetadata(ROLES_KEY, roles),
		UseGuards(JwtAuthGuard, RolesGuard),
	);
