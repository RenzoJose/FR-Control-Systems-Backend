import { Inject, Injectable } from '@nestjs/common';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';
import { toPrismaPagination, buildPaginatedResult, type PaginatedResult } from '../../../../shared/pagination/pagination.types';

export interface ListSalesParams {
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListSalesUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
  ) {}

  async execute(params?: ListSalesParams): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toPrismaPagination(params?.page, params?.limit);
    const { data, total } = await this.saleRepository.findAll(
      { channel: params?.channel, dateFrom: params?.dateFrom, dateTo: params?.dateTo },
      { skip, take },
    );
    return buildPaginatedResult(data, total, params?.page ?? 1, params?.limit ?? 10);
  }
}
