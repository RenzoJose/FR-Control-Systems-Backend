import { CreateCategoryDto } from '../dto/create-category.dto';
import { Category } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.token';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    const category = new Category(
      randomUUID(),
      dto.name,
      dto.slug,
      dto.description,
    );

    return this.categoryRepository.create(category);
  }
}
