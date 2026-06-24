import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  create(category: Category): Promise<Category>;

  findAll(): Promise<Category[]>;

  findById(id: string): Promise<Category | null>;

  update(category: Category): Promise<Category>;

  deactivate(id: string): Promise<void>;
}
