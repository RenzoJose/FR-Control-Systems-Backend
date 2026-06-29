import { ProfitSnapshot } from '../entities/profit-snapshot.entity';

export interface ProfitabilityRepository {
  findBySaleId(saleId: string): Promise<ProfitSnapshot | null>;

  upsert(snapshot: ProfitSnapshot): Promise<ProfitSnapshot>;
}
