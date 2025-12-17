import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [TypeOrmModule.forFeature([Product, ProductImage])],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
