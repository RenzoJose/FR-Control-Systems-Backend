import { Supplier } from '../../domain/entities/supplier.entity';

export interface SupplierRepository {
  create(supplier: Supplier): Promise<Supplier>;
  findAll(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  update(supplier: Supplier): Promise<Supplier>;
  deactivate(id: string): Promise<void>;
}
