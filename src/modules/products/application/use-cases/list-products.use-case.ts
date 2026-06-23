import { Inject, Injectable } from '@nestjs/common';

import { Product } from '../../domain/entities/product.entity';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.token';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(filters?: {
    categoryId?: string;
    supplierId?: string;
    search?: string;
  }): Promise<Product[]> {
    return this.productRepository.findAll(filters);
  }
}
