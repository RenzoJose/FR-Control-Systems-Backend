import { Inject, Injectable } from '@nestjs/common';
import type { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';
import { SALE_COST_REPOSITORY } from '../../domain/repositories/sale-cost.repository.token';
import { toPrismaPagination, buildPaginatedResult, type PaginatedResult } from '../../../../shared/pagination/pagination.types';

@Injectable()
export class ListSaleCostsUseCase {
  constructor(
    @Inject(SALE_COST_REPOSITORY)
    private readonly saleCostRepository: SaleCostRepository,
  ) {}

  async execute(saleId: string, page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toPrismaPagination(page, limit);
    const { data, total } = await this.saleCostRepository.findAllBySaleId(saleId, { skip, take });
    return buildPaginatedResult(data, total, page ?? 1, limit ?? 10);
  }
}
