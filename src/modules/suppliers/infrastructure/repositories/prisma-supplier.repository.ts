import { Injectable } from '@nestjs/common';
import { Supplier } from '../../domain/entities/supplier.entity';
import { SupplierRepository } from './supplier.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(supplier: Supplier): Promise<Supplier> {
    const created = await this.prisma.supplier.create({
      data: {
        id: supplier.id,
        name: supplier.name,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        notes: supplier.notes,
      },
    });

    return new Supplier(
      created.id,
      created.name,
      created.contactName ?? undefined,
      created.phone ?? undefined,
      created.email ?? undefined,
      created.notes ?? undefined,
      created.deletedAt ?? undefined,
    );
  }
  async findAll(): Promise<Supplier[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { deletedAt: null },
    });

    return suppliers.map(
      (s) =>
        new Supplier(
          s.id,
          s.name,
          s.contactName ?? undefined,
          s.phone ?? undefined,
          s.email ?? undefined,
          s.notes ?? undefined,
          s.deletedAt ?? undefined,
        ),
    );
  }

  async findById(id: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!supplier) return null;

    return new Supplier(
      supplier.id,
      supplier.name,
      supplier.contactName ?? undefined,
      supplier.phone ?? undefined,
      supplier.email ?? undefined,
      supplier.notes ?? undefined,
      supplier.deletedAt ?? undefined,
    );
  }
  async update(supplier: Supplier): Promise<Supplier> {
    const updated = await this.prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        name: supplier.name,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        notes: supplier.notes,
      },
    });

    return new Supplier(
      updated.id,
      updated.name,
      updated.contactName ?? undefined,
      updated.phone ?? undefined,
      updated.email ?? undefined,
      updated.notes ?? undefined,
      updated.deletedAt ?? undefined,
    );
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
