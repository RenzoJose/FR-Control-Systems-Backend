import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.token';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const currentCategory = await this.categoryRepository.findById(id);

    if (!currentCategory) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found',
      });
    }

    const category = new Category(
      currentCategory.id,
      dto.name ?? currentCategory.name,
      dto.slug ?? currentCategory.slug,
      dto.description ?? currentCategory.description,
      currentCategory.deletedAt,
    );

    return this.categoryRepository.update(category);
  }
}
