import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Supplier } from '../../domain/entities/supplier.entity';
import type { SupplierRepository } from '../../infrastructure/repositories/supplier.repository';
import { SUPPLIER_REPOSITORY } from '../../domain/repositories/supplier.repository.token';

@Injectable()
export class GetSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundException({
        code: 'SUPPLIER_NOT_FOUND',
        message: 'Supplier not found',
      });
    }

    return supplier;
  }
}
