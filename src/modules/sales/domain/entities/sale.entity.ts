import type { SaleItem } from './sale-item.entity';
import type { SaleCost } from './sale-cost.entity';

export class Sale {
  constructor(
    public readonly id: string,
    public saleChannel: string,
    public saleDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public deletedAt?: Date,
    public items?: SaleItem[],
    public costs?: SaleCost[],
  ) {}
}
