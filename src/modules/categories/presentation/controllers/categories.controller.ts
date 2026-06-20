import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateCategoryDto } from '../../application/dto/create-category.dto';
import { UpdateCategoryDto } from '../../application/dto/update-category.dto';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from '../../application/use-cases/deactivate-category.use-case';
import { GetCategoryUseCase } from '../../application/use-cases/get-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';

@ApiTags('Categories')
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deactivateCategoryUseCase: DeactivateCategoryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created' })
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.createCategoryUseCase.execute(dto);

    return {
      data: {
        id: category.id,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories listed' })
  async findAll() {
    const categories = await this.listCategoriesUseCase.execute();

    return { data: categories };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async findById(@Param('id') id: string) {
    const category = await this.getCategoryUseCase.execute(id);

    return { data: category };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category updated' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.updateCategoryUseCase.execute(id, dto);

    return { data: category };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate category' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Category deactivated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async deactivate(@Param('id') id: string) {
    await this.deactivateCategoryUseCase.execute(id);
  }
}
