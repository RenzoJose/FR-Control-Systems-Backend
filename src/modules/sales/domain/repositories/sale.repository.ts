import { Sale } from '../entities/sale.entity';

export interface SaleRepository {
  create(sale: Sale): Promise<Sale>;

  findAll(filters?: {
    channel?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Sale[]>;

  findById(id: string): Promise<Sale | null>;
}
