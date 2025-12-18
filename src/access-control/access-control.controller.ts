import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccessControlService } from './access-control.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Access Control - Roles & Permissions')
@ApiBearerAuth()
@Controller('access-control')
export class AccessControlController {
  constructor(
    private readonly accessControlService: AccessControlService,
  ) {}

  /**
   * ROLES ENDPOINTS
   */

  @Post('roles')
  @Auth({ roles: ['admin'], permissions: ['roles.create'] })
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para crear roles',
  })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.accessControlService.createRole(createRoleDto);
  }

  @Get('roles')
  @Auth({ permissions: ['roles.read'] })
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  findAllRoles() {
    return this.accessControlService.findAllRoles();
  }

  @Get('roles/:id')
  @Auth({ permissions: ['roles.read'] })
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOneRole(@Param('id', ParseIntPipe) id: number) {
    return this.accessControlService.findOneRole(id);
  }

  @Patch('roles/:id')
  @Auth({ roles: ['admin'], permissions: ['roles.update'] })
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para actualizar roles',
  })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.accessControlService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth({ roles: ['admin'], permissions: ['roles.delete'] })
  @ApiOperation({ summary: 'Eliminar un rol (soft delete)' })
  @ApiResponse({ status: 204, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para eliminar roles',
  })
  removeRole(@Param('id', ParseIntPipe) id: number) {
    return this.accessControlService.removeRole(id);
  }

  /**
   * ASIGNACIÓN DE PERMISOS A ROLES
   */

  @Post('roles/:id/permissions')
  @Auth({ roles: ['admin'], permissions: ['roles.update'] })
  @ApiOperation({
    summary: 'Asignar permisos a un rol (reemplaza los existentes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos asignados exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  assignPermissionsToRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.accessControlService.assignPermissionsToRole(
      id,
      assignPermissionsDto,
    );
  }

  @Patch('roles/:id/permissions/add')
  @Auth({ roles: ['admin'], permissions: ['roles.update'] })
  @ApiOperation({
    summary: 'Agregar permisos adicionales a un rol (sin reemplazar)',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos agregados exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  addPermissionsToRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.accessControlService.addPermissionsToRole(
      id,
      assignPermissionsDto,
    );
  }

  @Patch('roles/:id/permissions/remove')
  @Auth({ roles: ['admin'], permissions: ['roles.update'] })
  @ApiOperation({ summary: 'Remover permisos específicos de un rol' })
  @ApiResponse({
    status: 200,
    description: 'Permisos removidos exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  removePermissionsFromRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.accessControlService.removePermissionsFromRole(
      id,
      assignPermissionsDto,
    );
  }

  /**
   * PERMISOS ENDPOINTS (solo lectura)
   */

  @Get('permissions')
  @Auth({ permissions: ['permissions.read'] })
  @ApiOperation({ summary: 'Listar todos los permisos disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de permisos' })
  findAllPermissions() {
    return this.accessControlService.findAllPermissions();
  }

  @Get('permissions/:id')
  @Auth({ permissions: ['permissions.read'] })
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiResponse({ status: 200, description: 'Permiso encontrado' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  findOnePermission(@Param('id', ParseIntPipe) id: number) {
    return this.accessControlService.findOnePermission(id);
  }
}
