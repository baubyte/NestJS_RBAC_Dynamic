import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { Product } from 'src/product/entities';

@Injectable()
export class SeedService {
  constructor(
    // Users
    @InjectRepository(User)
    readonly userRepository: Repository<User>,

    @InjectRepository(Category)
    readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    readonly productRepository: Repository<Product>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    await this.insertUsers();
    await this.insertCategories();
    await this.insertProducts();

    return { message: 'Seed executed' };
  }

  // Borrar tablas
  async deleteTables() {
    await this.productRepository.deleteAll();
    await this.categoryRepository.deleteAll();
    await this.userRepository.deleteAll();
  }

  insertUsers() {
    const users = this.userRepository.create(initialData.users);
    return this.userRepository.save(users);
  }
  insertCategories() {
    const data = this.categoryRepository.create(initialData.categories);
    return this.categoryRepository.save(data);
  }

  insertProducts() {
    const data = this.productRepository.create(initialData.products);
    return this.productRepository.save(data);
  }

}
