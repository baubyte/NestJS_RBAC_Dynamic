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
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los permisos requeridos por la ruta
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      META_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene el decorador, permitimos el acceso
    if (!requiredPermissions) {
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

    // 1. Aplanamos (flat) todos los permisos de todos los roles del usuario en un solo array
    const allUserPermissions = user.roles
      .flatMap((role) => role.permissions) // Junta los arrays de permisos de cada rol
      .map((permission) => permission.slug);
    // 2. Eliminamos duplicados
    const userPermissions = Array.from(new Set(allUserPermissions));
    // 3. Verificamos que el usuario tenga todos los permisos requeridos
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
