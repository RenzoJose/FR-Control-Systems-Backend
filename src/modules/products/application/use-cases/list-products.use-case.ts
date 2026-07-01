import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.token';
import { toPrismaPagination, buildPaginatedResult, type PaginatedResult } from '../../../../shared/pagination/pagination.types';

export interface ListProductsParams {
  categoryId?: string;
  supplierId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(params?: ListProductsParams): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toPrismaPagination(params?.page, params?.limit);
    const { data, total } = await this.productRepository.findAll(
      { categoryId: params?.categoryId, supplierId: params?.supplierId, search: params?.search },
      { skip, take },
    );
    return buildPaginatedResult(data, total, params?.page ?? 1, params?.limit ?? 10);
  }
}
