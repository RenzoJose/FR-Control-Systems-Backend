import { Product } from '../entities/product.entity';

export interface ProductRepository {
  create(product: Product): Promise<Product>;
  findAll(
    filters?: { categoryId?: string; supplierId?: string; search?: string },
    pagination?: { skip: number; take: number },
  ): Promise<{ data: Product[]; total: number }>;
  findById(id: string): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  deactivate(id: string): Promise<void>;
}
