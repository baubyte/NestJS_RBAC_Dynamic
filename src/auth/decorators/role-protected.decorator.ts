import { SetMetadata } from '@nestjs/common';

export const META_ROLES = 'roles';

/**
 * Decorador para proteger rutas por roles
 * Ahora acepta strings para mayor flexibilidad con roles dinámicos
 *
 * @example
 * @RoleProtected('admin', 'editor')
 * @RoleProtected('super-admin')
 */
export const RoleProtected = (...args: string[]) => {
  return SetMetadata(META_ROLES, args);
};
