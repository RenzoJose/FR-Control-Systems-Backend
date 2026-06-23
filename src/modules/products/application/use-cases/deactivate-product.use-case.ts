import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { ProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.token';

@Injectable()
export class DeactivateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    await this.productRepository.deactivate(id);
  }
}
