import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';

let cachedApp: INestApplication<App> | null = null;
let cachedPrisma: PrismaService | null = null;

export async function getApp(): Promise<INestApplication<App>> {
  if (cachedApp) return cachedApp;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();

  cachedApp = app;
  cachedPrisma = app.get(PrismaService);
  return app;
}

export function getPrisma(): PrismaService {
  if (!cachedPrisma) throw new Error('App not initialized. Call getApp() first.');
  return cachedPrisma;
}

export async function cleanupDb(): Promise<void> {
  const prisma = getPrisma();
  await prisma.saleProfitSnapshot.deleteMany();
  await prisma.saleCost.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
}

export async function closeApp(): Promise<void> {
  if (cachedApp) {
    await cachedApp.close();
    cachedApp = null;
  }
  if (cachedPrisma) {
    await cachedPrisma.$disconnect();
    cachedPrisma = null;
  }
}

export async function seedCategory(name = 'Test Cat', slug = 'test-cat') {
  const app = await getApp();
  const res = await request(app.getHttpServer())
    .post('/api/v1/categories')
    .send({ name, slug });
  return res.body.data.id as string;
}

export async function seedSupplier(name = 'Test Supplier') {
  const app = await getApp();
  const res = await request(app.getHttpServer())
    .post('/api/v1/suppliers')
    .send({ name });
  return res.body.data.id as string;
}

export async function seedProduct(sku: string, categoryId: string, supplierId: string, name = 'Test Product') {
  const app = await getApp();
  const res = await request(app.getHttpServer())
    .post('/api/v1/products')
    .send({ sku, name, categoryId, supplierId });
  return res.body.data.id as string;
}
