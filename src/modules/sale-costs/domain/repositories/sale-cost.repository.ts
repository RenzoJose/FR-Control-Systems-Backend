import { SaleCost } from '../entities/sale-cost.entity';

export interface SaleCostRepository {
  create(cost: SaleCost): Promise<SaleCost>;

  findAllBySaleId(saleId: string): Promise<SaleCost[]>;

  findById(id: string): Promise<SaleCost | null>;

  update(cost: SaleCost): Promise<SaleCost>;

  deactivate(id: string): Promise<void>;
}
