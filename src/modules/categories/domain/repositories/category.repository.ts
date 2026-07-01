import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  create(category: Category): Promise<Category>;

  findAll(pagination?: { skip: number; take: number }): Promise<{ data: Category[]; total: number }>;

  findById(id: string): Promise<Category | null>;

  update(category: Category): Promise<Category>;

  deactivate(id: string): Promise<void>;
}
