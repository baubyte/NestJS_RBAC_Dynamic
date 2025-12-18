import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository, IsNull } from 'typeorm';
import { META_PERMISSIONS } from 'src/auth/decorators/require-permissions.decorator';
import { envs } from 'src/config/envs';

@Injectable()
export class PermissionsScannerService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsScannerService.name);
  private readonly autoSyncEnabled: boolean;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
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

  async syncPermissions(): Promise<{
    found: string[];
    created: string[];
    existing: string[];
  }> {
    this.logger.log('Escaneando permisos en los controladores...');

    // 1. Obtener todos los controladores de la aplicación
    const controllers = this.discoveryService.getControllers();
    const permissionsMap = new Map<
      string,
      { controller: string; method: string }
    >();

    // 2. Recorrer cada controlador y sus métodos
    controllers.forEach((wrapper) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { instance } = wrapper;
      if (!instance) return;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const controllerName = instance.constructor.name;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const prototype = Object.getPrototypeOf(instance);
      if (!prototype) return;

      // Obtener todos los métodos del controlador
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          name !== 'constructor' &&
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          typeof prototype[name] === 'function',
      );

      // Escanear cada método
      methodNames.forEach((methodName) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const methodHandler = instance[methodName];

        // Leer metadata del decorador @RequirePermissions (usado por @Auth)
        const permissions = this.reflector.get<string[]>(
          META_PERMISSIONS,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          methodHandler,
        );

        if (permissions && permissions.length > 0) {
          permissions.forEach((permission) => {
            if (!permissionsMap.has(permission)) {
              permissionsMap.set(permission, {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        `   - ${slug} (${location.controller}.${location.method})`,
      );
    });

    // 4. Sincronizar con la base de datos
    const result = await this.upsertPermissions(permissionsMap);

    this.logger.log('Sincronización de permisos completada');
    return result;
  }

  private async upsertPermissions(
    permissionsMap: Map<string, { controller: string; method: string }>,
  ): Promise<{
    found: string[];
    created: string[];
    existing: string[];
  }> {
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
    location: { controller: string; method: string },
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
  async forceSyncPermissions(): Promise<{
    found: string[];
    created: string[];
    existing: string[];
  }> {
    this.logger.log('Forzando sincronización manual de permisos...');
    return this.syncPermissions();
  }
}
