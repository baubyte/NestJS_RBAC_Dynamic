import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlController } from './access-control.controller';
import { PermissionsScannerService } from './permissions-scanner.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Permission } from './entities/';
import { AuthModule } from 'src/auth/auth.module';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  controllers: [AccessControlController],
  providers: [AccessControlService, PermissionsScannerService],
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
    AuthModule,
    DiscoveryModule, // Necesario para escanear controladores
  ],
  exports: [AccessControlService, PermissionsScannerService, TypeOrmModule],
})
export class AccessControlModule {}
