import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
      },
    });

    return new Product(
      created.id,
      created.sku,
      created.name,
      created.categoryId,
      created.supplierId,
      created.brand ?? undefined,
      created.deletedAt ?? undefined,
    );
  }

  async findAll(
    filters?: { categoryId?: string; supplierId?: string; search?: string },
    pagination?: { skip: number; take: number },
  ): Promise<{ data: Product[]; total: number }> {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: pagination?.skip,
        take: pagination?.take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(
        (p) =>
          new Product(
            p.id,
            p.sku,
            p.name,
            p.categoryId,
            p.supplierId,
            p.brand ?? undefined,
            p.deletedAt ?? undefined,
          ),
      ),
      total,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!product) return null;

    return new Product(
      product.id,
      product.sku,
      product.name,
      product.categoryId,
      product.supplierId,
      product.brand ?? undefined,
      product.deletedAt ?? undefined,
    );
  }

  async update(product: Product): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
      },
    });

    return new Product(
      updated.id,
      updated.sku,
      updated.name,
      updated.categoryId,
      updated.supplierId,
      updated.brand ?? undefined,
      updated.deletedAt ?? undefined,
    );
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
