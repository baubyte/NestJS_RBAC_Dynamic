/**
 * Utilidad para matching de permisos con soporte de wildcards
 *
 * Soporta los siguientes patrones:
 * - Exacto: "users.read"
 * - Wildcard de recurso: "users.*" (todos los permisos de users)
 * - Wildcard de acción: "*.read" (todos los .read de cualquier recurso)
 * - Wildcard total: "*" (todos los permisos)
 *
 * @example
 * ```typescript
 * matchPermission('users.read', 'users.*') // true
 * matchPermission('users.read', '*.read') // true
 * matchPermission('users.read', '*') // true
 * matchPermission('users.read', 'products.*') // false
 * ```
 */

/**
 * Verifica si un permiso específico coincide con un patrón
 *
 * @param permission - El permiso a verificar (ej: 'users.read')
 * @param pattern - El patrón a comparar (ej: 'users.*', '*.read', '*')
 * @returns true si el permiso coincide con el patrón
 */
export function matchPermission(permission: string, pattern: string): boolean {
  // Si el patrón es '*', coincide con todo
  if (pattern === '*') {
    return true;
  }

  // Si no hay wildcard, debe ser coincidencia exacta
  if (!pattern.includes('*')) {
    return permission === pattern;
  }

  // Convertir el patrón a regex
  // Escapar caracteres especiales de regex excepto *
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escapar caracteres especiales
    .replace(/\*/g, '.*'); // Reemplazar * con .*

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(permission);
}

/**
 * Verifica si un usuario tiene al menos uno de los permisos requeridos
 * considerando wildcards
 *
 * @param requiredPermissions - Lista de permisos requeridos
 * @param userPermissions - Lista de permisos del usuario (pueden incluir wildcards)
 * @returns true si el usuario tiene al menos un permiso requerido
 */
export function hasAnyPermission(
  requiredPermissions: string[],
  userPermissions: string[],
): boolean {
  return requiredPermissions.some((required) =>
    userPermissions.some((userPerm) => matchPermission(required, userPerm)),
  );
}

/**
 * Verifica si un usuario tiene todos los permisos requeridos
 * considerando wildcards
 *
 * @param requiredPermissions - Lista de permisos requeridos
 * @param userPermissions - Lista de permisos del usuario (pueden incluir wildcards)
 * @returns true si el usuario tiene todos los permisos requeridos
 */
export function hasAllPermissions(
  requiredPermissions: string[],
  userPermissions: string[],
): boolean {
  return requiredPermissions.every((required) =>
    userPermissions.some((userPerm) => matchPermission(required, userPerm)),
  );
}

/**
 * Expande un permiso con wildcard a una lista de permisos específicos
 *
 * @param wildcardPermission - Permiso con wildcard (ej: 'users.*')
 * @param availablePermissions - Lista de todos los permisos disponibles
 * @returns Lista de permisos específicos que coinciden con el patrón
 *
 * @example
 * ```typescript
 * expandWildcard('users.*', ['users.read', 'users.create', 'products.read'])
 * // Returns: ['users.read', 'users.create']
 * ```
 */
export function expandWildcard(
  wildcardPermission: string,
  availablePermissions: string[],
): string[] {
  return availablePermissions.filter((permission) =>
    matchPermission(permission, wildcardPermission),
  );
}

/**
 * Valida que un slug de permiso tenga formato correcto
 * Acepta:
 * - Permisos específicos: "users.read", "products.create"
 * - Wildcards de recurso: "users.*", "products.*"
 * - Wildcards de acción: "*.read", "*.create"
 * - Wildcard total: "*"
 *
 * @param slug - El slug a validar
 * @returns true si el formato es válido
 */
export function isValidPermissionSlug(slug: string): boolean {
  if (!slug || slug.trim() === '') {
    return false;
  }

  // Wildcard total
  if (slug === '*') {
    return true;
  }

  // Debe contener al menos un punto o ser *
  if (!slug.includes('.')) {
    return false;
  }

  // Patrón: recurso.acción o recurso.* o *.acción
  const parts = slug.split('.');

  if (parts.length !== 2) {
    return false;
  }

  const [resource, action] = parts;

  // Validar que cada parte sea válida (solo letras, números, guiones y *)
  const validPattern = /^[a-z0-9-*]+$/;

  return validPattern.test(resource) && validPattern.test(action);
}

/**
 * Normaliza un slug de permiso
 *
 * @param slug - El slug a normalizar
 * @returns Slug normalizado
 */
export function normalizePermissionSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.*-]/g, '');
}
