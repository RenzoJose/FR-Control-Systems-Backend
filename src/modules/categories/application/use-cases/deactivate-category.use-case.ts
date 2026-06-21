import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.token';

@Injectable()
export class DeactivateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found',
      });
    }

    await this.categoryRepository.deactivate(id);
  }
}
