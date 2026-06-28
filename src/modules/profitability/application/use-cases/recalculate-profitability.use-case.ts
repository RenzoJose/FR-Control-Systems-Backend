import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ProfitCalculatorService,
  type ProfitCalculation,
} from '../../domain/services/profit-calculator.service';
import type { ProfitabilityRepository } from '../../domain/repositories/profitability.repository';
import { PROFITABILITY_REPOSITORY } from '../../domain/repositories/profitability.repository.token';
import { ProfitSnapshot } from '../../domain/entities/profit-snapshot.entity';
import { SALE_REPOSITORY } from '../../../sales/domain/repositories/sale.repository.token';
import type { SaleRepository } from '../../../sales/domain/repositories/sale.repository';

@Injectable()
export class RecalculateProfitabilityUseCase {
  constructor(
    private readonly profitCalculator: ProfitCalculatorService,
    @Inject(PROFITABILITY_REPOSITORY)
    private readonly profitabilityRepository: ProfitabilityRepository,
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
  ) {}

  async execute(saleId: string): Promise<ProfitSnapshot> {
    const sale = await this.saleRepository.findById(saleId);

    if (!sale) {
      throw new NotFoundException({
        code: 'SALE_NOT_FOUND',
        message: 'Sale not found',
      });
    }

    const calculation: ProfitCalculation = this.profitCalculator.calculate(
      sale.items ?? [],
      sale.costs ?? [],
    );

    const snapshot = new ProfitSnapshot(
      saleId,
      calculation.revenueNet,
      calculation.totalCostNet,
      calculation.profit,
      calculation.marginPercentage,
      new Date(),
    );

    return this.profitabilityRepository.upsert(snapshot);
  }
}
