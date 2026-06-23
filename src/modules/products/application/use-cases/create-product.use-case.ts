import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../../domain/entities/product.entity';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.token';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const product = new Product(
      randomUUID(),
      dto.sku,
      dto.name,
      dto.categoryId,
      dto.supplierId,
      dto.brand,
    );

    return this.productRepository.create(product);
  }
}
