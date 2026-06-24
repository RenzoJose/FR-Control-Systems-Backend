import { Module } from '@nestjs/common';
import { CreateSupplierUseCase } from './application/use-cases/create-supplier.use-case';
import { DeactivateSupplierUseCase } from './application/use-cases/deactivate-supplier.use-case';
import { GetSupplierUseCase } from './application/use-cases/get-supplier.use-case';
import { ListSuppliersUseCase } from './application/use-cases/list-suppliers.use-case';
import { UpdateSupplierUseCase } from './application/use-cases/update-supplier.use-case';
import { SUPPLIER_REPOSITORY } from './domain/repositories/supplier.repository.token';
import { PrismaSupplierRepository } from './infrastructure/repositories/prisma-supplier.repository';
import { SuppliersController } from './presentation/controllers/suppliers.controller';

@Module({
  controllers: [SuppliersController],
  providers: [
    {
      provide: SUPPLIER_REPOSITORY,
      useClass: PrismaSupplierRepository,
    },
    CreateSupplierUseCase,
    DeactivateSupplierUseCase,
    GetSupplierUseCase,
    ListSuppliersUseCase,
    UpdateSupplierUseCase,
  ],
  exports: [SUPPLIER_REPOSITORY],
})
export class SuppliersModule {}
