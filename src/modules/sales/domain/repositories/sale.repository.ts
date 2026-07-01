import { Sale } from '../entities/sale.entity';

export interface UpdateSaleData {
  saleChannel?: string;
  saleDate?: Date;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPriceGross: number;
    unitPriceNet: number;
    vatAmount: number;
  }>;
  costs?: Array<{
    costType: string;
    description?: string;
    occurredAt: Date;
    costGross: number;
    costNet: number;
    vatAmount: number;
  }>;
}

export interface SaleRepository {
  create(sale: Sale): Promise<Sale>;

  update(id: string, data: UpdateSaleData): Promise<Sale>;

  findAll(
    filters?: { channel?: string; dateFrom?: string; dateTo?: string },
    pagination?: { skip: number; take: number },
  ): Promise<{ data: Sale[]; total: number }>;

  findById(id: string): Promise<Sale | null>;
}
