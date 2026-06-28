import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleItem } from '../../domain/entities/sale-item.entity';
import { SaleCost } from '../../domain/entities/sale-cost.entity';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { ProfitCalculatorService } from '../../../profitability/domain/services/profit-calculator.service';
import { PROFITABILITY_REPOSITORY } from '../../../profitability/domain/repositories/profitability.repository.token';
import type { ProfitabilityRepository } from '../../../profitability/domain/repositories/profitability.repository';
import { ProfitSnapshot } from '../../../profitability/domain/entities/profit-snapshot.entity';

@Injectable()
export class CreateSaleUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
    private readonly profitCalculator: ProfitCalculatorService,
    @Inject(PROFITABILITY_REPOSITORY)
    private readonly profitabilityRepository: ProfitabilityRepository,
  ) {}

  async execute(dto: CreateSaleDto): Promise<Sale> {
    const now = new Date();
    const saleId = randomUUID();

    const items = dto.items.map(
      (item) =>
        new SaleItem(
          randomUUID(),
          saleId,
          item.productId,
          item.quantity,
          item.unitPriceGross,
          item.unitPriceNet,
          item.vatAmount,
          now,
        ),
    );

    const costs = (dto.costs ?? []).map(
      (cost) =>
        new SaleCost(
          randomUUID(),
          saleId,
          cost.costType,
          cost.description,
          new Date(cost.occurredAt),
          cost.costGross,
          cost.costNet,
          cost.vatAmount,
          now,
          now,
        ),
    );

    const sale = new Sale(
      saleId,
      dto.saleChannel,
      new Date(dto.saleDate),
      now,
      now,
      undefined,
      items,
      costs,
    );

    const created = await this.saleRepository.create(sale);

    const calculation = this.profitCalculator.calculate(items, costs);

    const snapshot = new ProfitSnapshot(
      saleId,
      calculation.revenueNet,
      calculation.totalCostNet,
      calculation.profit,
      calculation.marginPercentage,
      now,
    );

    await this.profitabilityRepository.upsert(snapshot);

    return created;
  }
}
