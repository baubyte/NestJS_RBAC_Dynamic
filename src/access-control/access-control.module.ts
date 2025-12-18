import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlController } from './access-control.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Permission } from './entities/';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AccessControlController],
  providers: [AccessControlService],
  imports: [TypeOrmModule.forFeature([Role, Permission]), AuthModule],
  exports: [AccessControlService, TypeOrmModule],
})
export class AccessControlModule {}
