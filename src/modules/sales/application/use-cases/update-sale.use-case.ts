import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Sale } from '../../domain/entities/sale.entity';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import { RecalculateProfitabilityUseCase } from '../../../profitability/application/use-cases/recalculate-profitability.use-case';

@Injectable()
export class UpdateSaleUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
    private readonly recalculateProfitability: RecalculateProfitabilityUseCase,
  ) {}

  async execute(id: string, dto: UpdateSaleDto): Promise<Sale> {
    const existing = await this.saleRepository.findById(id);

    if (!existing) {
      throw new NotFoundException({
        code: 'SALE_NOT_FOUND',
        message: 'Sale not found',
      });
    }

    const data: Record<string, unknown> = {};

    if (dto.saleChannel !== undefined) {
      data.saleChannel = dto.saleChannel;
    }

    if (dto.saleDate !== undefined) {
      data.saleDate = new Date(dto.saleDate);
    }

    if (dto.items !== undefined) {
      data.items = dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceGross: item.unitPriceGross,
        unitPriceNet: item.unitPriceNet,
        vatAmount: item.vatAmount,
      }));
    }

    if (dto.costs !== undefined) {
      data.costs = dto.costs.map((cost) => ({
        costType: cost.costType,
        description: cost.description,
        occurredAt: new Date(cost.occurredAt),
        costGross: cost.costGross,
        costNet: cost.costNet,
        vatAmount: cost.vatAmount,
      }));
    }

    const updated = await this.saleRepository.update(id, data as never);

    await this.recalculateProfitability.execute(id);

    return updated;
  }
}
