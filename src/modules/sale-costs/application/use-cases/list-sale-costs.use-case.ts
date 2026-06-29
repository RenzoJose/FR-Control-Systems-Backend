import { Inject, Injectable } from '@nestjs/common';
import type { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';
import { SALE_COST_REPOSITORY } from '../../domain/repositories/sale-cost.repository.token';
import { SaleCost } from '../../domain/entities/sale-cost.entity';

@Injectable()
export class ListSaleCostsUseCase {
  constructor(
    @Inject(SALE_COST_REPOSITORY)
    private readonly saleCostRepository: SaleCostRepository,
  ) {}

  async execute(saleId: string): Promise<SaleCost[]> {
    return this.saleCostRepository.findAllBySaleId(saleId);
  }
}
