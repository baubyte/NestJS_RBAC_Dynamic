/* // permissions-scanner.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector, MetadataScanner } from '@nestjs/core';
//import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsScannerService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsScannerService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) { }

  async onModuleInit() {
    await this.syncPermissions();
  }

  private async syncPermissions() {
    this.logger.log('Escaneando permisos en los controladores...');

    // 1. Obtener todos los controladores de la app
    const controllers = this.discoveryService.getControllers();
    const permissionsSet = new Set<string>();

    // 2. Recorrer cada controlador y sus métodos
    controllers.forEach((wrapper) => {
      const { instance } = wrapper;
      // Si no hay instancia o no es un controlador real, saltar
      if (!instance || !Object.getPrototypeOf(instance)) return;

      // Escanear métodos del controlador
      const prototype = Object.getPrototypeOf(instance);
      this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        (methodName) => {
          const methodHandler = instance[methodName];

          // 3. Leer metadata del decorador @RequirePermissions
          const permissions = this.reflector.get<string[]>(
            PERMISSIONS_KEY,
            methodHandler,
          );

          if (permissions) {
            permissions.forEach((p) => permissionsSet.add(p));
          }
        },
      );
    });

    // 3. Guardar en Base de Datos
    const foundPermissions = Array.from(permissionsSet);

    if (foundPermissions.length > 0) {
      this.logger.log(`Permisos encontrados: ${foundPermissions.join(', ')}`);
      await this.upsertPermissions(foundPermissions);
    } else {
      this.logger.warn('No se encontraron permisos definidos en los controladores.');
    }
  }

  private async upsertPermissions(slugs: string[]) {
    // Busca los existentes
    const existing = await this.permissionsRepository.find();
    const existingSlugs = existing.map((p) => p.slug);

    // Filtra los nuevos
    const newSlugs = slugs.filter((slug) => !existingSlugs.includes(slug));

    if (newSlugs.length > 0) {
      const newPermissions = newSlugs.map((slug) =>
        this.permissionsRepository.create({
          slug,
          description: `Auto-generated permission for ${slug}`
        })
      );
      await this.permissionsRepository.save(newPermissions);
      this.logger.log(`¡Se han creado ${newSlugs.length} nuevos permisos en la BD!`);
    }
  }
} */