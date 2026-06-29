import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';
import { SaleCost } from '../../domain/entities/sale-cost.entity';

interface SaleCostResult {
  id: string;
  saleId: string;
  costType: string;
  description: string | null;
  occurredAt: Date;
  costGross: unknown;
  costNet: unknown;
  vatAmount: unknown;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class PrismaSaleCostRepository implements SaleCostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(cost: SaleCost): Promise<SaleCost> {
    const created = await this.prisma.saleCost.create({
      data: {
        id: cost.id,
        saleId: cost.saleId,
        costType: cost.costType as never,
        description: cost.description,
        occurredAt: cost.occurredAt,
        costGross: cost.costGross,
        costNet: cost.costNet,
        vatAmount: cost.vatAmount,
      },
    });

    return this.toDomain(created);
  }

  async findAllBySaleId(saleId: string): Promise<SaleCost[]> {
    const costs = await this.prisma.saleCost.findMany({
      where: { saleId, deletedAt: null },
    });

    return costs.map((c) => this.toDomain(c as never as SaleCostResult));
  }

  async findById(id: string): Promise<SaleCost | null> {
    const cost = await this.prisma.saleCost.findFirst({
      where: { id, deletedAt: null },
    });

    if (!cost) {
      return null;
    }

    return this.toDomain(cost);
  }

  async update(cost: SaleCost): Promise<SaleCost> {
    const updated = await this.prisma.saleCost.update({
      where: { id: cost.id },
      data: {
        costType: cost.costType as never,
        description: cost.description,
        occurredAt: cost.occurredAt,
        costGross: cost.costGross,
        costNet: cost.costNet,
        vatAmount: cost.vatAmount,
      },
    });

    return this.toDomain(updated);
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.saleCost.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private toDomain(cost: SaleCostResult): SaleCost {
    return new SaleCost(
      cost.id,
      cost.saleId,
      cost.costType,
      cost.description ?? undefined,
      cost.occurredAt,
      Number(cost.costGross),
      Number(cost.costNet),
      Number(cost.vatAmount),
      cost.createdAt,
      cost.updatedAt,
      cost.deletedAt ?? undefined,
    );
  }
}
