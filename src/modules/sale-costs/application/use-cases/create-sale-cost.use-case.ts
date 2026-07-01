import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SaleCost } from '../../domain/entities/sale-cost.entity';
import type { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';
import { SALE_COST_REPOSITORY } from '../../domain/repositories/sale-cost.repository.token';
import { CreateSaleCostDto } from '../dto/create-sale-cost.dto';
import { RecalculateProfitabilityUseCase } from '../../../profitability/application/use-cases/recalculate-profitability.use-case';
import { SALE_REPOSITORY } from '../../../sales/domain/repositories/sale.repository.token';
import type { SaleRepository } from '../../../sales/domain/repositories/sale.repository';
import { applyVatRate } from '../../../../shared/vat/vat.helper';

@Injectable()
export class CreateSaleCostUseCase {
  constructor(
    @Inject(SALE_COST_REPOSITORY)
    private readonly saleCostRepository: SaleCostRepository,
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
    private readonly recalculateProfitability: RecalculateProfitabilityUseCase,
  ) {}

  async execute(saleId: string, dto: CreateSaleCostDto): Promise<SaleCost> {
    const sale = await this.saleRepository.findById(saleId);

    if (!sale) {
      throw new NotFoundException({
        code: 'SALE_NOT_FOUND',
        message: 'Sale not found',
      });
    }

    const now = new Date();

    const vat = applyVatRate({
      unitPriceGross: dto.costGross,
      unitPriceNet: dto.costNet,
      vatAmount: dto.vatAmount,
      vatRate: dto.vatRate,
    });

    const cost = new SaleCost(
      randomUUID(),
      saleId,
      dto.costType,
      dto.description,
      new Date(dto.occurredAt),
      vat.unitPriceGross,
      vat.unitPriceNet,
      vat.vatAmount,
      now,
      now,
    );

    const created = await this.saleCostRepository.create(cost);

    await this.recalculateProfitability.execute(saleId);

    return created;
  }
}
