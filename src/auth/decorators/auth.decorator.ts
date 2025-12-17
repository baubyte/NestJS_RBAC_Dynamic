import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from './require-permissions.decorator';
import { RolesPermissionsGuard } from '../guards/role-permissions.guard';

export function Auth(...permission: string[]) {
  return applyDecorators(
    RequirePermissions(...permission),
    UseGuards(AuthGuard(), RolesPermissionsGuard),
  );
}
