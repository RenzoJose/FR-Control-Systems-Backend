import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from './application/use-cases/deactivate-category.use-case';
import { GetCategoryUseCase } from './application/use-cases/get-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.token';
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma-category.repository';
import { CategoriesController } from './presentation/controllers/categories.controller';

@Module({
  controllers: [CategoriesController],
  providers: [
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
    CreateCategoryUseCase,
    DeactivateCategoryUseCase,
    GetCategoryUseCase,
    ListCategoriesUseCase,
    UpdateCategoryUseCase,
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
