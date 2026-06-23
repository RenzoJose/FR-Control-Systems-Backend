import { Module } from '@nestjs/common';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { DeactivateProductUseCase } from './application/use-cases/deactivate-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.token';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository';
import { ProductsController } from './presentation/controllers/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    CreateProductUseCase,
    DeactivateProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
