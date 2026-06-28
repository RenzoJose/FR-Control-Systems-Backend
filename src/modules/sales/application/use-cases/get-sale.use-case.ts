import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Sale } from '../../domain/entities/sale.entity';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';

@Injectable()
export class GetSaleUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
  ) {}

  async execute(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(id);

    if (!sale) {
      throw new NotFoundException({
        code: 'SALE_NOT_FOUND',
        message: 'Sale not found',
      });
    }

    return sale;
  }
}
