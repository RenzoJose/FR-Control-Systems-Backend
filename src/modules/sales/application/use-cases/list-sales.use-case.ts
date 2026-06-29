import { Inject, Injectable } from '@nestjs/common';
import { Sale } from '../../domain/entities/sale.entity';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';

@Injectable()
export class ListSalesUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
  ) {}

  async execute(filters?: {
    channel?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Sale[]> {
    return this.saleRepository.findAll(filters);
  }
}
