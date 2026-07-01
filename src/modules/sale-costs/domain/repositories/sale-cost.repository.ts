import { SaleCost } from '../entities/sale-cost.entity';

export interface SaleCostRepository {
  create(cost: SaleCost): Promise<SaleCost>;

  findAllBySaleId(saleId: string, pagination?: { skip: number; take: number }): Promise<{ data: SaleCost[]; total: number }>;

  findById(id: string): Promise<SaleCost | null>;

  update(cost: SaleCost): Promise<SaleCost>;

  deactivate(id: string): Promise<void>;
}
