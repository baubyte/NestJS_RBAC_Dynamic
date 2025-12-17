import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { handleDBExceptions } from 'src/common/exceptions/handle-db-exceptions';

@Injectable()
export class CategoryService {


  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>

  ) { }


  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const dto = { ...createCategoryDto } as CreateCategoryDto;
      if (dto.name && typeof dto.name === 'string') {
        dto.name = dto.name.toUpperCase();
      }
      const category = this.categoryRepository.create(dto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      handleDBExceptions(error, 'create category');
    }
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findByName(name: string) {
    try {
      const normalized = (name && typeof name === 'string') ? name.toUpperCase() : name;
      const category = await this.categoryRepository.findOne({ where: { name: normalized } });
      if (!category) throw new NotFoundException(`Category with name '${name}' not found`);
      return category;
    } catch (error) {
      handleDBExceptions(error, 'find by name category');
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } })
      if (!category)
        throw new NotFoundException(`Brand #${id} not found`)
      return category;
    } catch (error) {
      handleDBExceptions(error, 'find one category');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const dto = { ...updateCategoryDto } as UpdateCategoryDto;
      if (dto.name && typeof dto.name === 'string') {
        dto.name = dto.name.toUpperCase();
      }

      const category = await this.categoryRepository.preload({ id, ...dto });
      if (!category) throw new NotFoundException(`Category #${id} not found`);

      return await this.categoryRepository.save(category);
    } catch (error) {
      handleDBExceptions(error, 'update category');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.categoryRepository.softDelete(id);

      if ((result.affected ?? 0) === 0) {
        throw new NotFoundException(`Category #${id} not found`);
      }

      return { message: `Category #${id} soft deleted successfully` };
    } catch (error) {
      handleDBExceptions(error, 'remove category');

    }
  }

}
