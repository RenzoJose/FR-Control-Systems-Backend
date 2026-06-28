import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleItem } from '../../domain/entities/sale-item.entity';
import { SaleCost } from '../../domain/entities/sale-cost.entity';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';
import { CreateSaleDto } from '../dto/create-sale.dto';

@Injectable()
export class CreateSaleUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: SaleRepository,
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

    return this.saleRepository.create(sale);
  }
}
