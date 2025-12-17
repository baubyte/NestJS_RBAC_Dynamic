import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [AuthModule, CategoryModule, ProductModule],
})
export class SeedModule {}
