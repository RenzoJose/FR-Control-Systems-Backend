import { Inject, Injectable } from '@nestjs/common';
import type { SupplierRepository } from '../../infrastructure/repositories/supplier.repository';
import { SUPPLIER_REPOSITORY } from '../../domain/repositories/supplier.repository.token';
import { toPrismaPagination, buildPaginatedResult, type PaginatedResult } from '../../../../shared/pagination/pagination.types';

@Injectable()
export class ListSuppliersUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toPrismaPagination(page, limit);
    const { data, total } = await this.supplierRepository.findAll({ skip, take });
    return buildPaginatedResult(data, total, page ?? 1, limit ?? 10);
  }
}
