import { Inject, Injectable } from '@nestjs/common';

import { Supplier } from '../../domain/entities/supplier.entity';
import type { SupplierRepository } from '../../infrastructure/repositories/supplier.repository';
import { SUPPLIER_REPOSITORY } from '../../domain/repositories/supplier.repository.token';

@Injectable()
export class ListSuppliersUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(): Promise<Supplier[]> {
    return this.supplierRepository.findAll();
  }
}
