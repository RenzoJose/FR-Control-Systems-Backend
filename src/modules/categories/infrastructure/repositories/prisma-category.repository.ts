import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

import { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });

    return new Category(
      created.id,
      created.name,
      created.slug ?? undefined,
      created.description ?? undefined,
      created.deletedAt ?? undefined,
    );
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
    });

    return categories.map(
      (category) =>
        new Category(
          category.id,
          category.name,
          category.slug ?? undefined,
          category.description ?? undefined,
          category.deletedAt ?? undefined,
        ),
    );
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!category) {
      return null;
    }

    return new Category(
      category.id,
      category.name,
      category.slug ?? undefined,
      category.description ?? undefined,
      category.deletedAt ?? undefined,
    );
  }

  async update(category: Category): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });

    return new Category(
      updated.id,
      updated.name,
      updated.slug ?? undefined,
      updated.description ?? undefined,
      updated.deletedAt ?? undefined,
    );
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
