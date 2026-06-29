import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { ProfitabilityRepository } from '../../domain/repositories/profitability.repository';
import { ProfitSnapshot } from '../../domain/entities/profit-snapshot.entity';

interface SnapshotResult {
  saleId: string;
  revenueNet: unknown;
  totalCostNet: unknown;
  profit: unknown;
  marginPercentage: unknown;
  createdAt: Date;
}

@Injectable()
export class PrismaProfitabilityRepository implements ProfitabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySaleId(saleId: string): Promise<ProfitSnapshot | null> {
    const snapshot = await this.prisma.saleProfitSnapshot.findUnique({
      where: { saleId },
    });

    if (!snapshot) {
      return null;
    }

    return this.toDomain(snapshot);
  }

  async upsert(snapshot: ProfitSnapshot): Promise<ProfitSnapshot> {
    const result = await this.prisma.saleProfitSnapshot.upsert({
      where: { saleId: snapshot.saleId },
      update: {
        revenueNet: snapshot.revenueNet,
        totalCostNet: snapshot.totalCostNet,
        profit: snapshot.profit,
        marginPercentage: snapshot.marginPercentage,
      },
      create: {
        saleId: snapshot.saleId,
        revenueNet: snapshot.revenueNet,
        totalCostNet: snapshot.totalCostNet,
        profit: snapshot.profit,
        marginPercentage: snapshot.marginPercentage,
      },
    });

    return this.toDomain(result);
  }

  private toDomain(snapshot: SnapshotResult): ProfitSnapshot {
    return new ProfitSnapshot(
      snapshot.saleId,
      Number(snapshot.revenueNet),
      Number(snapshot.totalCostNet),
      Number(snapshot.profit),
      Number(snapshot.marginPercentage),
      snapshot.createdAt,
    );
  }
}
