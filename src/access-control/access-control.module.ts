import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlController } from './access-control.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Permission } from './entities/';

@Module({
  controllers: [AccessControlController],
  providers: [AccessControlService],
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  exports: [AccessControlService],
})
export class AccessControlModule {}
