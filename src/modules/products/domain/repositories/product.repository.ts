import { Product } from '../entities/product.entity';

export interface ProductRepository {
  create(product: Product): Promise<Product>;
  findAll(filters?: {
    categoryId?: string;
    supplierId?: string;
    search?: string;
  }): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  deactivate(id: string): Promise<void>;
}
