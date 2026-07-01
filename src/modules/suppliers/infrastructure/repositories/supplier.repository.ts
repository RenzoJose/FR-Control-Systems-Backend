import { Supplier } from '../../domain/entities/supplier.entity';

export interface SupplierRepository {
  create(supplier: Supplier): Promise<Supplier>;
  findAll(pagination?: { skip: number; take: number }): Promise<{ data: Supplier[]; total: number }>;
  findById(id: string): Promise<Supplier | null>;
  update(supplier: Supplier): Promise<Supplier>;
  deactivate(id: string): Promise<void>;
}
