import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto';
import { Role, Permission } from './entities';
import { handleDBExceptions } from 'src/common/exceptions/handle-db-exceptions';

@Injectable()
export class AccessControlService {
  private readonly logger = new Logger(AccessControlService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * ROLES CRUD
   */

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const { permission_ids, ...roleData } = createRoleDto;

      // Crear el rol
      const role = this.roleRepository.create(roleData);

      // Si se proporcionan permisos, asignarlos
      if (permission_ids && permission_ids.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(permission_ids),
        });

        if (permissions.length !== permission_ids.length) {
          throw new BadRequestException('Some permission IDs are invalid');
        }

        role.permissions = permissions;
      }

      await this.roleRepository.save(role);
      this.logger.log(`Role created: ${role.slug} (ID: ${role.id})`);

      return role;
    } catch (error) {
      handleDBExceptions(error, 'AccessControlService.createRole');
    }
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['permissions'],
      order: { created_at: 'DESC' },
    });
  }

  async findOneRole(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      const { permission_ids, ...roleData } = updateRoleDto;

      const role = await this.findOneRole(id);

      // Actualizar datos básicos del rol
      Object.assign(role, roleData);

      // Si se proporcionan nuevos permisos, reemplazarlos
      if (permission_ids !== undefined) {
        if (permission_ids.length > 0) {
          const permissions = await this.permissionRepository.findBy({
            id: In(permission_ids),
          });

          if (permissions.length !== permission_ids.length) {
            throw new BadRequestException('Some permission IDs are invalid');
          }

          role.permissions = permissions;
        } else {
          // Si se envía un array vacío, remover todos los permisos
          role.permissions = [];
        }
      }

      await this.roleRepository.save(role);
      this.logger.log(`Role updated: ${role.slug} (ID: ${role.id})`);

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleDBExceptions(error, 'AccessControlService.updateRole');
    }
  }

  async removeRole(id: number): Promise<void> {
    const role = await this.findOneRole(id);

    // Soft delete
    role.deleted_at = new Date();
    await this.roleRepository.save(role);

    this.logger.log(`Role soft deleted: ${role.slug} (ID: ${role.id})`);
  }

  /**
   * ASIGNACIÓN DE PERMISOS A ROLES
   */

  async assignPermissionsToRole(
    roleId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ): Promise<Role> {
    try {
      const role = await this.findOneRole(roleId);
      const { permission_ids } = assignPermissionsDto;

      const permissions = await this.permissionRepository.findBy({
        id: In(permission_ids),
      });

      if (permissions.length !== permission_ids.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }

      role.permissions = permissions;
      await this.roleRepository.save(role);

      this.logger.log(
        `Permissions assigned to role ${role.slug}: [${permissions.map((p) => p.slug).join(', ')}]`,
      );

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleDBExceptions(error, 'AccessControlService.assignPermissionsToRole');
    }
  }

  async addPermissionsToRole(
    roleId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ): Promise<Role> {
    try {
      const role = await this.findOneRole(roleId);
      const { permission_ids } = assignPermissionsDto;

      const newPermissions = await this.permissionRepository.findBy({
        id: In(permission_ids),
      });

      if (newPermissions.length !== permission_ids.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }

      // Obtener IDs de permisos actuales
      const currentPermissionIds = role.permissions.map((p) => p.id);

      // Filtrar solo los permisos que no están ya asignados
      const permissionsToAdd = newPermissions.filter(
        (p) => !currentPermissionIds.includes(p.id),
      );

      if (permissionsToAdd.length === 0) {
        throw new BadRequestException(
          'All specified permissions are already assigned to this role',
        );
      }

      role.permissions = [...role.permissions, ...permissionsToAdd];
      await this.roleRepository.save(role);

      this.logger.log(
        `Permissions added to role ${role.slug}: [${permissionsToAdd.map((p) => p.slug).join(', ')}]`,
      );

      return role;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      handleDBExceptions(error, 'AccessControlService.addPermissionsToRole');
    }
  }

  async removePermissionsFromRole(
    roleId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ): Promise<Role> {
    try {
      const role = await this.findOneRole(roleId);
      const { permission_ids } = assignPermissionsDto;

      // Filtrar los permisos que NO están en la lista a remover
      role.permissions = role.permissions.filter(
        (permission) => !permission_ids.includes(permission.id),
      );

      await this.roleRepository.save(role);

      this.logger.log(
        `Permissions removed from role ${role.slug}: IDs [${permission_ids.join(', ')}]`,
      );

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleDBExceptions(
        error,
        'AccessControlService.removePermissionsFromRole',
      );
    }
  }

  /**
   * PERMISOS - Solo lectura
   */

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { deleted_at: IsNull() },
      order: { slug: 'ASC' },
    });
  }

  async findOnePermission(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async findPermissionsByIds(ids: number[]): Promise<Permission[]> {
    return this.permissionRepository.findBy({
      id: In(ids),
      deleted_at: IsNull(),
    });
  }

  /**
   * UTILIDADES
   */

  async getRoleWithPermissions(roleId: number): Promise<Role> {
    return this.findOneRole(roleId);
  }

  async getRoleBySlug(slug: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { slug, deleted_at: IsNull() },
      relations: ['permissions'],
    });
  }
}
