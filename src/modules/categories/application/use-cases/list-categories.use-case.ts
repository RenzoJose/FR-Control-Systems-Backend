import { Inject, Injectable } from '@nestjs/common';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.token';
import { toPrismaPagination, buildPaginatedResult, type PaginatedResult } from '../../../../shared/pagination/pagination.types';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toPrismaPagination(page, limit);
    const { data, total } = await this.categoryRepository.findAll({ skip, take });
    return buildPaginatedResult(data, total, page ?? 1, limit ?? 10);
  }
}
