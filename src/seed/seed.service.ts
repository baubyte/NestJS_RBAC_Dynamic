import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { Product, ProductImage } from 'src/product/entities';
import { Permission, Role } from 'src/access-control/entities';
import { SeedExecution } from './entities/seed-execution.entity';
import { envs } from 'src/config/envs';
import { PermissionsScannerService } from 'src/access-control/permissions-scanner.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Permission)
    readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    readonly roleRepository: Repository<Role>,
    @InjectRepository(SeedExecution)
    readonly seedExecutionRepository: Repository<SeedExecution>,
    private readonly permissionsScannerService: PermissionsScannerService,
  ) {}

  async runSeed() {
    const environment = envs.nodeEnv;

    // Verificar si ya se ejecutó en producción
    if (environment === 'production') {
      const previousExecution = await this.seedExecutionRepository.findOne({
        where: { environment: 'production', success: true },
      });

      if (previousExecution) {
        throw new ForbiddenException(
          `Seed already executed in production on ${previousExecution.executed_at.toDateString()}. ` +
            'For security reasons, seed can only be executed once in production environment.',
        );
      }
    }

    try {
      await this.deleteTables();
      await this.insertRoles();
      await this.insertUsers();
      await this.insertCategories();
      await this.insertProducts();

      // Ejecutar scanner para detectar y crear permisos del código
      this.logger.log('Ejecutando scanner de permisos...');
      const scanResult = await this.permissionsScannerService.syncPermissions();

      this.logger.log(
        `Scanner completado: ${scanResult.found.length} permisos encontrados, ` +
          `${scanResult.created.length} nuevos creados, ` +
          `${scanResult.existing.length} ya existían`,
      );

      // Registrar ejecución exitosa
      const execution = this.seedExecutionRepository.create({
        environment,
        success: true,
        message: `Seed executed successfully. Scanner: ${scanResult.created.length} permissions created, ${scanResult.existing.length} existing.`,
      });
      await this.seedExecutionRepository.save(execution);

      this.logger.log(`Seed ejecutado exitosamente en ambiente ${environment}`);

      return {
        message: 'Seed executed successfully',
        environment,
        timestamp: new Date(),
        scanner: {
          permissionsFound: scanResult.found.length,
          permissionsCreated: scanResult.created.length,
          permissionsExisting: scanResult.existing.length,
          newPermissions: scanResult.created,
        },
      };
    } catch (error) {
      // Registrar ejecución fallida
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      const execution = this.seedExecutionRepository.create({
        environment,
        success: false,
        message: errorMessage,
      });
      await this.seedExecutionRepository.save(execution);

      this.logger.error(
        `Seed failed in ${environment} environment: ${errorMessage}`,
      );
      throw error;
    }
  }

  // Borrar tablas con foreign key checks deshabilitados
  async deleteTables() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Deshabilitar foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

      // Limpiar tablas en orden (primero las tablas dependientes)
      await queryRunner.query('TRUNCATE TABLE `product_images`');
      await queryRunner.query('TRUNCATE TABLE `products`');
      await queryRunner.query('TRUNCATE TABLE `categories`');
      await queryRunner.query('TRUNCATE TABLE `users_roles`');
      await queryRunner.query('TRUNCATE TABLE `users`');
      await queryRunner.query('TRUNCATE TABLE `role_permissions`');
      await queryRunner.query('TRUNCATE TABLE `roles`');
      await queryRunner.query('TRUNCATE TABLE `permissions`');
      // NO truncar seed_executions para mantener el historial

      // Rehabilitar foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      await queryRunner.release();
    }
  }

  async insertRoles() {
    // Crear roles vacíos (los permisos se asignarán automáticamente por el scanner)
    const roles = this.roleRepository.create(
      initialData.roles.map((r) => ({
        slug: r.slug,
        description: r.description,
      })),
    );
    await this.roleRepository.save(roles);
    this.logger.log(
      `✓ ${roles.length} roles creados (permisos se asignarán por auto-asignación)`,
    );
  }

  insertUsers() {
    const users = this.userRepository.create(initialData.users);
    return this.userRepository.save(users);
  }

  insertCategories() {
    const data = this.categoryRepository.create(initialData.categories);
    return this.categoryRepository.save(data);
  }

  insertProducts() {
    const data = this.productRepository.create(initialData.products);
    return this.productRepository.save(data);
  }

  // Método adicional para ver el historial de ejecuciones
  async getExecutionHistory() {
    return this.seedExecutionRepository.find({
      order: { executed_at: 'DESC' },
      take: 10,
    });
  }
}
