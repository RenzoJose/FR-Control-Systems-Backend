import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { SaleRepository } from '../../domain/repositories/sale.repository';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleItem } from '../../domain/entities/sale-item.entity';
import { SaleCost } from '../../domain/entities/sale-cost.entity';
import type { UpdateSaleData } from '../../domain/repositories/sale.repository';

interface SaleResult {
  id: string;
  saleChannel: string;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  items: SaleItemResult[];
  costs: SaleCostResult[];
}

interface SaleItemResult {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPriceGross: unknown;
  unitPriceNet: unknown;
  vatAmount: unknown;
  createdAt: Date;
}

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
export class PrismaSaleRepository implements SaleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(sale: Sale): Promise<Sale> {
    const data: Record<string, unknown> = {
      id: sale.id,
      saleChannel: sale.saleChannel,
      saleDate: sale.saleDate,
      items: {
        create: sale.items!.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceGross: item.unitPriceGross,
          unitPriceNet: item.unitPriceNet,
          vatAmount: item.vatAmount,
        })),
      },
    };

    if (sale.costs && sale.costs.length > 0) {
      data.costs = {
        create: sale.costs.map((cost) => ({
          id: cost.id,
          costType: cost.costType,
          description: cost.description,
          occurredAt: cost.occurredAt,
          costGross: cost.costGross,
          costNet: cost.costNet,
          vatAmount: cost.vatAmount,
        })),
      };
    }

    const created = await this.prisma.sale.create({
      data: data as never,
      include: { items: true, costs: true },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateSaleData): Promise<Sale> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const saleFields: Record<string, unknown> = {};

      if (data.saleChannel !== undefined) {
        saleFields.saleChannel = data.saleChannel;
      }
      if (data.saleDate !== undefined) {
        saleFields.saleDate = data.saleDate;
      }

      if (Object.keys(saleFields).length > 0) {
        await tx.sale.update({ where: { id }, data: saleFields });
      }

      if (data.items !== undefined) {
        await tx.saleItem.deleteMany({ where: { saleId: id } });

        if (data.items.length > 0) {
          await tx.saleItem.createMany({
            data: data.items.map((item) => ({
              id: randomUUID(),
              saleId: id,
              productId: item.productId,
              quantity: item.quantity,
              unitPriceGross: item.unitPriceGross,
              unitPriceNet: item.unitPriceNet,
              vatAmount: item.vatAmount,
            })),
          });
        }
      }

      if (data.costs !== undefined) {
        await tx.saleCost.updateMany({
          where: { saleId: id, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        if (data.costs.length > 0) {
          await tx.saleCost.createMany({
            data: data.costs.map((cost) => ({
              id: randomUUID(),
              saleId: id,
              costType: cost.costType as never,
              description: cost.description,
              occurredAt: cost.occurredAt,
              costGross: cost.costGross,
              costNet: cost.costNet,
              vatAmount: cost.vatAmount,
            })),
          });
        }
      }

      const result = await tx.sale.findUnique({
        where: { id },
        include: {
          items: true,
          costs: { where: { deletedAt: null } },
        },
      });

      return result!;
    });

    return this.toDomain(updated as never as SaleResult);
  }

  async findAll(filters?: {
    channel?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Sale[]> {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filters?.channel) {
      where.saleChannel = filters.channel;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      const saleDate: Record<string, Date> = {};

      if (filters.dateFrom) {
        saleDate.gte = new Date(filters.dateFrom);
      }

      if (filters.dateTo) {
        saleDate.lte = new Date(filters.dateTo);
      }

      where.saleDate = saleDate;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        items: true,
        costs: {
          where: { deletedAt: null },
        },
      },
      orderBy: { saleDate: 'desc' },
    });

    return sales.map((s) => this.toDomain(s as never as SaleResult));
  }

  async findById(id: string): Promise<Sale | null> {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        items: true,
        costs: {
          where: { deletedAt: null },
        },
      },
    });

    if (!sale) {
      return null;
    }

    return this.toDomain(sale);
  }

  private toDomain(sale: SaleResult): Sale {
    const items = sale.items.map(
      (item) =>
        new SaleItem(
          item.id,
          item.saleId,
          item.productId,
          item.quantity,
          Number(item.unitPriceGross),
          Number(item.unitPriceNet),
          Number(item.vatAmount),
          item.createdAt,
        ),
    );

    const costs = sale.costs.map(
      (cost) =>
        new SaleCost(
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
        ),
    );

    return new Sale(
      sale.id,
      sale.saleChannel,
      sale.saleDate,
      sale.createdAt,
      sale.updatedAt,
      sale.deletedAt ?? undefined,
      items,
      costs,
    );
  }
}
