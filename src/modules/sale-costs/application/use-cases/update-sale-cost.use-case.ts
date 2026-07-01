import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';
import { SALE_COST_REPOSITORY } from '../../domain/repositories/sale-cost.repository.token';
import { UpdateSaleCostDto } from '../dto/update-sale-cost.dto';
import { SaleCost } from '../../domain/entities/sale-cost.entity';
import { RecalculateProfitabilityUseCase } from '../../../profitability/application/use-cases/recalculate-profitability.use-case';
import { applyVatRate } from '../../../../shared/vat/vat.helper';

@Injectable()
export class UpdateSaleCostUseCase {
  constructor(
    @Inject(SALE_COST_REPOSITORY)
    private readonly saleCostRepository: SaleCostRepository,
    private readonly recalculateProfitability: RecalculateProfitabilityUseCase,
  ) {}

  async execute(
    saleId: string,
    costId: string,
    dto: UpdateSaleCostDto,
  ): Promise<SaleCost> {
    const existing = await this.saleCostRepository.findById(costId);

    if (!existing || existing.saleId !== saleId) {
      throw new NotFoundException({
        code: 'SALE_COST_NOT_FOUND',
        message: 'Sale cost not found',
      });
    }

    const now = new Date();

    const costGross = dto.costGross ?? existing.costGross;
    const costNet = dto.costNet !== undefined ? dto.costNet : existing.costNet;
    const vatAmount = dto.vatAmount !== undefined ? dto.vatAmount : existing.vatAmount;
    const vatRate = dto.vatRate;

    const vat = vatRate !== undefined
      ? applyVatRate({ unitPriceGross: costGross, vatRate })
      : applyVatRate({ unitPriceGross: costGross, unitPriceNet: costNet, vatAmount });

    const updated = new SaleCost(
      costId,
      saleId,
      dto.costType ?? existing.costType,
      dto.description !== undefined ? dto.description : existing.description,
      dto.occurredAt ? new Date(dto.occurredAt) : existing.occurredAt,
      vat.unitPriceGross,
      vat.unitPriceNet,
      vat.vatAmount,
      existing.createdAt,
      now,
    );

    const result = await this.saleCostRepository.update(updated);

    await this.recalculateProfitability.execute(saleId);

    return result;
  }
}
