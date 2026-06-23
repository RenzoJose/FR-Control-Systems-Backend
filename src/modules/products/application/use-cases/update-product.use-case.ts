import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../../domain/entities/product.entity';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.token';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<Product> {
    const currentProduct = await this.productRepository.findById(id);

    if (!currentProduct) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    const product = new Product(
      currentProduct.id,
      dto.sku ?? currentProduct.sku,
      dto.name ?? currentProduct.name,
      dto.categoryId ?? currentProduct.categoryId,
      dto.supplierId ?? currentProduct.supplierId,
      dto.brand ?? currentProduct.brand,
      currentProduct.deletedAt,
    );

    return this.productRepository.update(product);
  }
}
