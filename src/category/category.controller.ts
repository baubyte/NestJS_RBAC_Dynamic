import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.categoryService.findByName(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const parsed = Number(id);
    if (isNaN(parsed)) throw new BadRequestException('id must be a number');
    return this.categoryService.findOne(parsed);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const parsed = Number(id);
    if (isNaN(parsed)) throw new BadRequestException('id must be a number');
    return this.categoryService.update(parsed, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const parsed = Number(id);
    if (isNaN(parsed)) throw new BadRequestException('id must be a number');
    return this.categoryService.remove(parsed);
  }
}
