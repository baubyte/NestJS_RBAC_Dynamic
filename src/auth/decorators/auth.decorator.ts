import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from './require-permissions.decorator';
import { RoleProtected } from './role-protected.decorator';
import { RolesPermissionsGuard } from '../guards/role-permissions.guard';

/**
 * Opciones para el decorador Auth
 */
export interface AuthOptions {
  /** Permisos requeridos (ej: ['users.create', 'users.read']) */
  permissions?: string[];
  /** Roles requeridos (ej: ['admin', 'editor']) */
  roles?: string[];
}

/**
 * Decorador flexible para autenticación y autorización
 *
 * @example
 * // Solo validar autenticación (sin permisos ni roles)
 * @Auth()
 *
 * // Validar permisos específicos
 * @Auth({ permissions: ['users.create'] })
 *
 * // Validar roles específicos
 * @Auth({ roles: ['admin', 'editor'] })
 *
 * // Validar permisos Y roles (debe cumplir ambos)
 * @Auth({
 *   permissions: ['users.create'],
 *   roles: ['admin']
 * })
 *
 * @Auth('users.create', 'users.read')
 */
export function Auth(...args: string[] | [AuthOptions]) {
  const decorators = [UseGuards(AuthGuard())];

  // Si el primer argumento es un objeto (AuthOptions)
  if (
    args.length === 1 &&
    typeof args[0] === 'object' &&
    !Array.isArray(args[0])
  ) {
    const options = args[0];

    if (options.permissions && options.permissions.length > 0) {
      decorators.push(RequirePermissions(...options.permissions));
    }

    if (options.roles && options.roles.length > 0) {
      decorators.push(RoleProtected(...options.roles));
    }

    if (options.permissions || options.roles) {
      decorators.push(UseGuards(RolesPermissionsGuard));
    }
  }
  // Si son strings (permisos directamente)
  else if (args.length > 0 && args.every((arg) => typeof arg === 'string')) {
    decorators.push(RequirePermissions(...args));
    decorators.push(UseGuards(RolesPermissionsGuard));
  }

  return applyDecorators(...decorators);
}
