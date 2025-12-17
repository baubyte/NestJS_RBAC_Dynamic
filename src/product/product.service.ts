import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/exceptions/handle-db-exceptions';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      return product;
    } catch (error) {
      handleDBExceptions(error, 'Create product');
    }
  }

  async findAll() {
    return this.productRepository.find({});
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      handleDBExceptions(error, 'Update product');
    }
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    try {
      await this.productRepository.softRemove(product);
      return { message: `Product with ID ${id} removed successfully` };
    } catch (error) {
      handleDBExceptions(error, 'Remove product');
    }
  }
}
