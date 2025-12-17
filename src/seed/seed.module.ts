import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductModule } from 'src/product/product.module';
import { AccessControlModule } from 'src/access-control/access-control.module';
import { SeedExecution } from './entities/seed-execution.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([SeedExecution]),
    AuthModule,
    CategoryModule,
    ProductModule,
    AccessControlModule,
  ],
})
export class SeedModule {}
