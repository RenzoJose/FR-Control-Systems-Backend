import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

export interface DashboardSummary {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

export interface ProfitTrendItem {
  date: string;
  profit: number;
}

export interface TopItem {
  id: string;
  name: string;
  profit: number;
  revenue: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummary> {
    const snapshots = await this.prisma.saleProfitSnapshot.findMany();

    const revenue = snapshots.reduce((sum, s) => sum + Number(s.revenueNet), 0);
    const costs = snapshots.reduce((sum, s) => sum + Number(s.totalCostNet), 0);
    const profit = snapshots.reduce((sum, s) => sum + Number(s.profit), 0);
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, costs, profit, margin };
  }

  async getProfitTrend(from?: string, to?: string): Promise<ProfitTrendItem[]> {
    const where: Record<string, unknown> = {};

    if (from || to) {
      const saleDate: Record<string, Date> = {};

      if (from) {
        saleDate.gte = new Date(from);
      }

      if (to) {
        saleDate.lte = new Date(to);
      }

      where.saleDate = saleDate;
    }

    const sales = await this.prisma.sale.findMany({
      where: { ...where, deletedAt: null },
      include: { profitSnapshot: true },
      orderBy: { saleDate: 'asc' },
    });

    return sales
      .filter((s) => s.profitSnapshot)
      .map((s) => ({
        date: s.saleDate.toISOString().split('T')[0],
        profit: Number(s.profitSnapshot!.profit),
      }));
  }

  async getTopProducts(limit = 10): Promise<TopItem[]> {
    const items = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { unitPriceNet: true },
      orderBy: { _sum: { unitPriceNet: 'desc' } },
      take: limit,
    });

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
      },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    return items.map((item) => ({
      id: item.productId,
      name: productMap.get(item.productId) ?? 'Unknown',
      revenue: Number(item._sum.unitPriceNet ?? 0),
      profit: 0,
    }));
  }

  async getTopSuppliers(limit = 10): Promise<TopItem[]> {
    const sales = await this.prisma.sale.findMany({
      where: { deletedAt: null },
      include: {
        items: {
          include: { product: true },
        },
        profitSnapshot: true,
      },
    });

    const supplierMap = new Map<
      string,
      { name: string; profit: number; revenue: number }
    >();

    for (const sale of sales) {
      const supplierIds = [
        ...new Set(sale.items.map((i) => i.product.supplierId)),
      ];

      for (const supplierId of supplierIds) {
        const existing = supplierMap.get(supplierId) ?? {
          name: '',
          profit: 0,
          revenue: 0,
        };

        existing.revenue += Number(sale.profitSnapshot?.revenueNet ?? 0);
        existing.profit += Number(sale.profitSnapshot?.profit ?? 0);
        supplierMap.set(supplierId, existing);
      }
    }

    const suppliers = await this.prisma.supplier.findMany({
      where: { id: { in: [...supplierMap.keys()] } },
      select: { id: true, name: true },
    });

    for (const supplier of suppliers) {
      const entry = supplierMap.get(supplier.id);

      if (entry) {
        entry.name = supplier.name;
      }
    }

    return [...supplierMap.entries()]
      .map(([id, data]) => ({
        id,
        name: data.name,
        profit: data.profit,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }

  async getTopCategories(limit = 10): Promise<TopItem[]> {
    const sales = await this.prisma.sale.findMany({
      where: { deletedAt: null },
      include: {
        items: {
          include: { product: true },
        },
        profitSnapshot: true,
      },
    });

    const categoryMap = new Map<
      string,
      { name: string; profit: number; revenue: number }
    >();

    for (const sale of sales) {
      const categoryIds = [
        ...new Set(sale.items.map((i) => i.product.categoryId)),
      ];

      for (const categoryId of categoryIds) {
        const existing = categoryMap.get(categoryId) ?? {
          name: '',
          profit: 0,
          revenue: 0,
        };

        existing.revenue += Number(sale.profitSnapshot?.revenueNet ?? 0);
        existing.profit += Number(sale.profitSnapshot?.profit ?? 0);
        categoryMap.set(categoryId, existing);
      }
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: [...categoryMap.keys()] } },
      select: { id: true, name: true },
    });

    for (const category of categories) {
      const entry = categoryMap.get(category.id);

      if (entry) {
        entry.name = category.name;
      }
    }

    return [...categoryMap.entries()]
      .map(([id, data]) => ({
        id,
        name: data.name,
        profit: data.profit,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }

  async getTopChannels(limit = 10): Promise<TopItem[]> {
    const sales = await this.prisma.sale.findMany({
      where: { deletedAt: null },
      include: { profitSnapshot: true },
    });

    const channelMap = new Map<string, { profit: number; revenue: number }>();

    for (const sale of sales) {
      const existing = channelMap.get(sale.saleChannel) ?? {
        profit: 0,
        revenue: 0,
      };

      existing.revenue += Number(sale.profitSnapshot?.revenueNet ?? 0);
      existing.profit += Number(sale.profitSnapshot?.profit ?? 0);
      channelMap.set(sale.saleChannel, existing);
    }

    return [...channelMap.entries()]
      .map(([channel, data]) => ({
        id: channel,
        name: channel,
        profit: data.profit,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }
}
