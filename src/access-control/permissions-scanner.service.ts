import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { Repository, IsNull, In } from 'typeorm';
import { META_PERMISSIONS } from 'src/auth/decorators/require-permissions.decorator';
import { envs } from 'src/config/envs';
import { matchPermission } from 'src/common/utils/permission-matcher.util';

/**
 * Interfaces para mejorar el tipado del scanner
 */
interface PermissionLocation {
  controller: string;
  method: string;
}

interface PermissionSyncResult {
  found: string[];
  created: string[];
  existing: string[];
}

interface ControllerInstance {
  constructor: { name: string };
  [key: string]: unknown;
}

/**
 * Type guard para validar que una instancia es un objeto controlador válido
 */
function isControllerInstance(
  instance: unknown,
): instance is ControllerInstance {
  return (
    instance !== null &&
    typeof instance === 'object' &&
    'constructor' in instance &&
    typeof (instance as Record<string, unknown>).constructor === 'function'
  );
}

@Injectable()
export class PermissionsScannerService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsScannerService.name);
  private readonly autoSyncEnabled: boolean;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    // Habilitar auto-sync solo en desarrollo/staging (no en producción por defecto)
    this.autoSyncEnabled =
      envs.nodeEnv === 'development' || envs.permissionsAutoSync;
  }

  async onModuleInit() {
    if (!this.autoSyncEnabled) {
      this.logger.log(
        'Auto-sync de permisos deshabilitado (solo desarrollo/staging)',
      );
      return;
    }

    await this.syncPermissions();
  }

  async syncPermissions(): Promise<PermissionSyncResult> {
    this.logger.log('Escaneando permisos en los controladores...');

    // 1. Obtener todos los controladores de la aplicación
    const controllers = this.discoveryService.getControllers();
    const permissionsMap = new Map<string, PermissionLocation>();

    // 2. Recorrer cada controlador y sus métodos
    controllers.forEach((wrapper) => {
      // DiscoveryService devuelve InstanceWrapper<any>, validamos con type guard
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const instance = wrapper.instance;
      if (!isControllerInstance(instance)) {
        return;
      }

      const controllerInstance = instance;
      const controllerName = controllerInstance.constructor.name;
      const prototype = Object.getPrototypeOf(controllerInstance) as object;

      if (!prototype) {
        return;
      }

      // Obtener todos los métodos del controlador
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
          return (
            name !== 'constructor' &&
            descriptor &&
            typeof descriptor.value === 'function'
          );
        },
      );

      // Escanear cada método
      methodNames.forEach((methodName) => {
        const methodHandler = controllerInstance[methodName];

        // Verificar que sea una función antes de leer metadata
        if (typeof methodHandler !== 'function') return;

        // Leer metadata del decorador @RequirePermissions (usado por @Auth)
        const permissions = this.reflector.get<string[]>(
          META_PERMISSIONS,
          methodHandler,
        );

        if (Array.isArray(permissions) && permissions.length > 0) {
          permissions.forEach((permission) => {
            if (!permissionsMap.has(permission)) {
              permissionsMap.set(permission, {
                controller: controllerName,
                method: methodName,
              });
            }
          });
        }
      });
    });

    // 3. Procesar permisos encontrados
    const foundPermissions = Array.from(permissionsMap.entries());

    if (foundPermissions.length === 0) {
      this.logger.warn(
        'No se encontraron permisos definidos con @Auth() o @RequirePermissions()',
      );
      return { found: [], created: [], existing: [] };
    }

    this.logger.log(`Permisos encontrados: ${foundPermissions.length}`);
    foundPermissions.forEach(([slug, location]) => {
      this.logger.debug(
        `- ${slug} (${location.controller}.${location.method})`,
      );
    });

    // 4. Sincronizar con la base de datos
    const result = await this.upsertPermissions(permissionsMap);

    // 5. Auto-asignar permisos nuevos a roles según reglas configuradas
    if (result.created.length > 0) {
      await this.autoAssignPermissionsToRoles(result.created);
    }

    this.logger.log('Sincronización de permisos completada');
    return result;
  }

  private async upsertPermissions(
    permissionsMap: Map<string, PermissionLocation>,
  ): Promise<PermissionSyncResult> {
    const slugs = Array.from(permissionsMap.keys());

    // Buscar permisos existentes (solo activos, no soft-deleted)
    const existing = await this.permissionsRepository.find({
      where: { deleted_at: IsNull() },
    });
    const existingSlugs = new Set(existing.map((p) => p.slug));

    // Filtrar permisos nuevos
    const newSlugs = slugs.filter((slug) => !existingSlugs.has(slug));

    if (newSlugs.length > 0) {
      const newPermissions = newSlugs.map((slug) => {
        const location = permissionsMap.get(slug)!;
        const description = this.generateDescription(slug, location);

        return this.permissionsRepository.create({
          slug,
          description,
        });
      });

      await this.permissionsRepository.save(newPermissions);

      this.logger.log(
        `Se crearon ${newSlugs.length} nuevos permisos en la BD:`,
      );
      newSlugs.forEach((slug) => {
        this.logger.log(`   + ${slug}`);
      });
    } else {
      this.logger.log('Todos los permisos ya existen en la BD');
    }

    return {
      found: slugs,
      created: newSlugs,
      existing: slugs.filter((slug) => existingSlugs.has(slug)),
    };
  }

  private generateDescription(
    slug: string,
    location: PermissionLocation,
  ): string {
    // Parsear slug: 'users.create' -> 'Create users'
    const parts = slug.split('.');
    if (parts.length >= 2) {
      const [resource, action] = parts;
      const actionText = action;
      return `${actionText} ${resource} (${location.controller}.${location.method})`;
    }

    return `Permiso: ${slug} (${location.controller}.${location.method})`;
  }
  /**
   * Auto-asigna permisos nuevos a roles basándose en reglas configuradas
   *
   * Las reglas se definen en AUTO_ASSIGN_PERMISSIONS_RULES con formato:
   * {"super-admin":["*"],"admin":["*.read","*.create","*.update"],"editor":["*.read"]}
   *
   * @param newPermissionSlugs - Lista de permisos recién creados
   */
  private async autoAssignPermissionsToRoles(
    newPermissionSlugs: string[],
  ): Promise<void> {
    const rules = envs.autoAssignPermissionsRules;

    if (!rules || Object.keys(rules).length === 0) {
      this.logger.debug(
        'No hay reglas de auto-asignación configuradas (AUTO_ASSIGN_PERMISSIONS_RULES)',
      );
      return;
    }

    this.logger.log('Aplicando auto-asignación de permisos a roles...');

    // Obtener los permisos recién creados de la BD
    const newPermissions = await this.permissionsRepository.find({
      where: { slug: In(newPermissionSlugs) },
    });

    // Recorrer cada regla configurada
    for (const [roleSlug, patterns] of Object.entries(rules)) {
      // Buscar el rol
      const role = await this.roleRepository.findOne({
        where: { slug: roleSlug },
        relations: ['permissions'],
      });

      if (!role) {
        this.logger.warn(
          `Rol "${roleSlug}" no encontrado, saltando auto-asignación`,
        );
        continue;
      }

      // Filtrar permisos que coincidan con los patrones del rol
      const permissionsToAssign = newPermissions.filter((permission) =>
        patterns.some((pattern) => matchPermission(permission.slug, pattern)),
      );

      if (permissionsToAssign.length === 0) {
        continue;
      }

      // Obtener IDs de permisos actuales del rol
      const currentPermissionIds = new Set(role.permissions.map((p) => p.id));

      // Agregar solo los permisos que no tenga ya
      const permissionsToAdd = permissionsToAssign.filter(
        (p) => !currentPermissionIds.has(p.id),
      );

      if (permissionsToAdd.length > 0) {
        role.permissions.push(...permissionsToAdd);
        await this.roleRepository.save(role);

        this.logger.log(
          `Rol "${roleSlug}" recibió ${permissionsToAdd.length} nuevo(s) permiso(s):`,
        );
        permissionsToAdd.forEach((p) => {
          this.logger.log(`     + ${p.slug}`);
        });
      }
    }
  }

  async forceSyncPermissions(): Promise<PermissionSyncResult> {
    this.logger.log('Forzando sincronización manual de permisos...');
    return this.syncPermissions();
  }
}
