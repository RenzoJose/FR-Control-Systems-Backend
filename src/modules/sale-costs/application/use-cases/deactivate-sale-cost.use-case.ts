import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';
import { SALE_COST_REPOSITORY } from '../../domain/repositories/sale-cost.repository.token';
import { RecalculateProfitabilityUseCase } from '../../../profitability/application/use-cases/recalculate-profitability.use-case';

@Injectable()
export class DeactivateSaleCostUseCase {
  constructor(
    @Inject(SALE_COST_REPOSITORY)
    private readonly saleCostRepository: SaleCostRepository,
    private readonly recalculateProfitability: RecalculateProfitabilityUseCase,
  ) {}

  async execute(saleId: string, costId: string): Promise<void> {
    const existing = await this.saleCostRepository.findById(costId);

    if (!existing || existing.saleId !== saleId) {
      throw new NotFoundException({
        code: 'SALE_COST_NOT_FOUND',
        message: 'Sale cost not found',
      });
    }

    await this.saleCostRepository.deactivate(costId);

    await this.recalculateProfitability.execute(saleId);
  }
}
