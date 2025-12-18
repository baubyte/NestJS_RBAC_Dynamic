import { Request } from 'express';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_PERMISSIONS } from '../decorators/require-permissions.decorator';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

/**
 * Guard que valida roles Y/O permisos del usuario
 * Permite proteger rutas solo con roles, solo con permisos, o ambos
 */
@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los permisos y roles requeridos por la ruta
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      META_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      META_ROLES,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene ni permisos ni roles, permitimos el acceso
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario de la petición (inyectado previamente por AuthGuard/Passport)
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.roles || user.roles.length === 0) {
      throw new ForbiddenException('User has no roles assigned');
    }

    // 3. Validar roles si son requeridos
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = user.roles.map((role) => role.slug);
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenException(
          `User needs one of these roles: [${requiredRoles.join(', ')}]`,
        );
      }
    }

    // 4. Validar permisos si son requeridos
    if (requiredPermissions && requiredPermissions.length > 0) {
      // Aplanamos todos los permisos de todos los roles del usuario
      const allUserPermissions = user.roles
        .flatMap((role) => role.permissions)
        .map((permission) => permission.slug);

      // Eliminamos duplicados
      const userPermissions = Array.from(new Set(allUserPermissions));

      // Verificamos que el usuario tenga TODOS los permisos requeridos
      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `User needs all these permissions: [${requiredPermissions.join(', ')}]`,
        );
      }
    }

    return true;
  }
}
