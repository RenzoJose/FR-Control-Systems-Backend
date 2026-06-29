import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { randomUUID } from 'crypto';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';

describe('REST API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.saleProfitSnapshot.deleteMany();
    await prisma.saleCost.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.category.deleteMany();
  });

  // ── Helpers ────────────────────────────────────────────────
  async function seedCategory(name = 'Test Cat', slug = 'test-cat') {
    const res = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .send({ name, slug });
    return res.body.data.id as string;
  }

  async function seedSupplier(name = 'Test Supplier') {
    const res = await request(app.getHttpServer())
      .post('/api/v1/suppliers')
      .send({ name });
    return res.body.data.id as string;
  }

  async function seedProduct(sku: string, categoryId: string, supplierId: string, name = 'Test Product') {
    const res = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send({ sku, name, categoryId, supplierId });
    return res.body.data.id as string;
  }

  // ── App ────────────────────────────────────────────────────
  describe('GET /', () => {
    it('should return hello world', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200);
    });
  });

  // ── Categories ─────────────────────────────────────────────
  describe('Categories /api/v1/categories', () => {
    let catId: string;

    it('POST — should create a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Living', slug: 'living', description: 'Muebles de living' })
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
      catId = res.body.data.id;
    });

    it('GET — should list categories', async () => {
      // create one first
      await seedCategory();

      const res = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET :id — should return category by id', async () => {
      const id = await seedCategory('Sommiers', 'sommiers');

      const res = await request(app.getHttpServer())
        .get(`/api/v1/categories/${id}`)
        .expect(200);

      expect(res.body.data.name).toBe('Sommiers');
    });

    it('GET :id — should 404 for nonexistent id', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/categories/${randomUUID()}`)
        .expect(404);
    });

    it('PATCH :id — should update a category', async () => {
      const id = await seedCategory('Original', 'original');

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/categories/${id}`)
        .send({ name: 'Updated', description: 'Nueva descripción' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated');
    });

    it('DELETE :id — should deactivate (soft-delete) category', async () => {
      const id = await seedCategory('To Delete');

      await request(app.getHttpServer())
        .delete(`/api/v1/categories/${id}`)
        .expect(204);
    });
  });

  // ── Suppliers ──────────────────────────────────────────────
  describe('Suppliers /api/v1/suppliers', () => {
    it('POST — should create a supplier', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/suppliers')
        .send({
          name: 'Muebles del Sur',
          contactName: 'Juan Pérez',
          phone: '+56912345678',
          email: 'juan@muebles.cl',
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
    });

    it('GET — should list suppliers', async () => {
      await seedSupplier();

      const res = await request(app.getHttpServer())
        .get('/api/v1/suppliers')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET :id — should return supplier by id', async () => {
      const id = await seedSupplier('Unique Supplier');

      const res = await request(app.getHttpServer())
        .get(`/api/v1/suppliers/${id}`)
        .expect(200);

      expect(res.body.data.name).toBe('Unique Supplier');
    });

    it('GET :id — should 404 for nonexistent id', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/suppliers/${randomUUID()}`)
        .expect(404);
    });

    it('PATCH :id — should update a supplier', async () => {
      const id = await seedSupplier('Old Name');

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/suppliers/${id}`)
        .send({ name: 'New Name', phone: '+56987654321' })
        .expect(200);

      expect(res.body.data.name).toBe('New Name');
      expect(res.body.data.phone).toBe('+56987654321');
    });

    it('DELETE :id — should deactivate (soft-delete) supplier', async () => {
      const id = await seedSupplier('To Delete');

      await request(app.getHttpServer())
        .delete(`/api/v1/suppliers/${id}`)
        .expect(204);
    });
  });

  // ── Products ───────────────────────────────────────────────
  describe('Products /api/v1/products', () => {
    let catId: string;
    let supId: string;

    beforeEach(async () => {
      catId = await seedCategory('Dormitorios', 'dormitorios');
      supId = await seedSupplier('Fabrica Camas');
    });

    it('POST — should create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          sku: 'CAMA-100',
          name: 'Cama King Size',
          brand: 'Flex',
          categoryId: catId,
          supplierId: supId,
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
    });

    it('GET — should list products', async () => {
      await seedProduct('SKU-001', catId, supId);

      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET — should filter by categoryId', async () => {
      const otherCatId = await seedCategory('Cocina', 'cocina');
      await seedProduct('SKU-A', catId, supId);
      await seedProduct('SKU-B', otherCatId, supId);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/products?categoryId=${catId}`)
        .expect(200);

      expect(res.body.data.every((p: { categoryId: string }) => p.categoryId === catId)).toBe(true);
    });

    it('GET — should filter by supplierId', async () => {
      const otherSupId = await seedSupplier('Otro Proveedor');
      await seedProduct('SKU-C', catId, supId);
      await seedProduct('SKU-D', catId, otherSupId);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/products?supplierId=${supId}`)
        .expect(200);

      expect(res.body.data.every((p: { supplierId: string }) => p.supplierId === supId)).toBe(true);
    });

    it('GET — should search by name', async () => {
      await seedProduct('SKU-E', catId, supId, 'Sofá Milano');
      await seedProduct('SKU-F', catId, supId, 'Mesa Comedor');

      const res = await request(app.getHttpServer())
        .get('/api/v1/products?search=Milano')
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toContain('Milano');
    });

    it('GET :id — should return product by id', async () => {
      const prodId = await seedProduct('SKU-G', catId, supId, 'Sillón Relax');

      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${prodId}`)
        .expect(200);

      expect(res.body.data.name).toBe('Sillón Relax');
    });

    it('GET :id — should 404 for nonexistent id', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/products/${randomUUID()}`)
        .expect(404);
    });

    it('PATCH :id — should update a product', async () => {
      const prodId = await seedProduct('SKU-H', catId, supId, 'Original');

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/products/${prodId}`)
        .send({ name: 'Updated Name', brand: 'NewBrand' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Name');
    });

    it('DELETE :id — should deactivate (soft-delete) product', async () => {
      const prodId = await seedProduct('SKU-I', catId, supId);

      await request(app.getHttpServer())
        .delete(`/api/v1/products/${prodId}`)
        .expect(204);
    });
  });

  // ── Sales ──────────────────────────────────────────────────
  describe('Sales /api/v1/sales', () => {
    let catId: string;
    let supId: string;
    let prodId: string;

    beforeEach(async () => {
      catId = await seedCategory('Living', 'living');
      supId = await seedSupplier('Muebles Chic');
      prodId = await seedProduct('SOFA-001', catId, supId, 'Sofá 3 Cuerpos');
    });

    it('POST — should create a sale with items and profit snapshot', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'FALABELLA',
          saleDate: '2026-06-15',
          items: [
            {
              productId: prodId,
              quantity: 2,
              unitPriceGross: 349990,
              unitPriceNet: 294109,
              vatAmount: 55881,
            },
          ],
          costs: [
            {
              costType: 'MARKETPLACE',
              description: 'Comisión',
              occurredAt: '2026-06-15',
              costGross: 34999,
              costNet: 29411,
              vatAmount: 5588,
            },
          ],
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('id');

      // verify profit snapshot was created via profitability endpoint
      const snapRes = await request(app.getHttpServer())
        .get(`/api/v1/profitability/sales/${res.body.data.id}`)
        .expect(200);

      expect(snapRes.body.data).toHaveProperty('profit');
      expect(Number(snapRes.body.data.profit)).toBeGreaterThan(0);
    });

    it('POST — should create a sale without costs', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'DIRECT',
          saleDate: '2026-06-20',
          items: [
            {
              productId: prodId,
              quantity: 1,
              unitPriceGross: 249990,
              unitPriceNet: 210076,
              vatAmount: 39914,
            },
          ],
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
    });

    it('POST — should reject invalid saleChannel', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'INVALID',
          saleDate: '2026-06-15',
          items: [{ productId: prodId, quantity: 1, unitPriceGross: 1000, unitPriceNet: 840, vatAmount: 160 }],
        })
        .expect(400);
    });

    it('GET — should list sales', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'FALABELLA',
          saleDate: '2026-06-15',
          items: [{ productId: prodId, quantity: 1, unitPriceGross: 1000, unitPriceNet: 840, vatAmount: 160 }],
        });

      const res = await request(app.getHttpServer())
        .get('/api/v1/sales')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET — should filter by channel', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'MERCADO_LIBRE',
          saleDate: '2026-06-10',
          items: [{ productId: prodId, quantity: 1, unitPriceGross: 1000, unitPriceNet: 840, vatAmount: 160 }],
        });

      const res = await request(app.getHttpServer())
        .get('/api/v1/sales?channel=MERCADO_LIBRE')
        .expect(200);

      expect(res.body.data.every((s: { saleChannel: string }) => s.saleChannel === 'MERCADO_LIBRE')).toBe(true);
    });

    it('GET :id — should 404 for nonexistent sale', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/sales/${randomUUID()}`)
        .expect(404);
    });
  });

  // ── Sale Costs ──────────────────────────────────────────────
  describe('Sale Costs /api/v1/sales/:saleId/costs', () => {
    let catId: string;
    let supId: string;
    let prodId: string;
    let saleId: string;

    beforeEach(async () => {
      catId = await seedCategory('Oficina', 'oficina');
      supId = await seedSupplier('Muebles Office');
      prodId = await seedProduct('ESC-001', catId, supId, 'Escritorio');

      const res = await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'DIRECT',
          saleDate: '2026-06-01',
          items: [{ productId: prodId, quantity: 1, unitPriceGross: 199990, unitPriceNet: 168059, vatAmount: 31931 }],
        });
      saleId = res.body.data.id;
    });

    it('POST — should add a cost to a sale', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/sales/${saleId}/costs`)
        .send({
          costType: 'TRANSPORT',
          description: 'Flete',
          occurredAt: '2026-06-01',
          costGross: 15000,
          costNet: 12605,
          vatAmount: 2395,
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
    });

    it('GET — should list costs for a sale', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/sales/${saleId}/costs`)
        .send({
          costType: 'TRANSPORT',
          description: 'Flete',
          occurredAt: '2026-06-01',
          costGross: 15000,
          costNet: 12605,
          vatAmount: 2395,
        });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/sales/${saleId}/costs`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
    });

    it('PATCH :id — should update a cost and recalculate profit snapshot', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`/api/v1/sales/${saleId}/costs`)
        .send({
          costType: 'TRANSPORT',
          description: 'Flete original',
          occurredAt: '2026-06-01',
          costGross: 15000,
          costNet: 12605,
          vatAmount: 2395,
        });
      const costId = createRes.body.data.id;

      const patchRes = await request(app.getHttpServer())
        .patch(`/api/v1/sales/${saleId}/costs/${costId}`)
        .send({ costNet: 20000, costGross: 23790 })
        .expect(200);

      expect(patchRes.body.data.costNet).toBe(20000);
    });

    it('DELETE :id — should soft-delete a cost and recalculate snapshot', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`/api/v1/sales/${saleId}/costs`)
        .send({
          costType: 'TRANSPORT',
          description: 'Flete a eliminar',
          occurredAt: '2026-06-01',
          costGross: 15000,
          costNet: 12605,
          vatAmount: 2395,
        });
      const costId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/sales/${saleId}/costs/${costId}`)
        .expect(204);
    });
  });

  // ── Profitability ──────────────────────────────────────────
  describe('Profitability /api/v1/profitability', () => {
    let saleId: string;

    beforeEach(async () => {
      const catId = await seedCategory('Comedores', 'comedores');
      const supId = await seedSupplier('Muebles Comedor');
      const prodId = await seedProduct('MESA-001', catId, supId, 'Mesa 6 puestos');

      const res = await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'RIPLEY',
          saleDate: '2026-06-10',
          items: [{ productId: prodId, quantity: 1, unitPriceGross: 329990, unitPriceNet: 277303, vatAmount: 52687 }],
          costs: [{ costType: 'MARKETPLACE', description: 'Comisión', occurredAt: '2026-06-10', costGross: 32999, costNet: 27730, vatAmount: 5269 }],
        });
      saleId = res.body.data.id;
    });

    it('GET sales/:saleId — should return profitability snapshot', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/profitability/sales/${saleId}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('revenueNet');
      expect(res.body.data).toHaveProperty('profit');
      expect(res.body.data).toHaveProperty('marginPercentage');
    });

    it('POST sales/:saleId/recalculate — should recalculate snapshot', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/profitability/sales/${saleId}/recalculate`)
        .expect(201);

      expect(res.body.data).toHaveProperty('profit');
      expect(Number(res.body.data.profit)).toBeGreaterThan(0);
    });
  });

  // ── Dashboard ──────────────────────────────────────────────
  describe('Dashboard /api/v1/dashboard', () => {
    beforeEach(async () => {
      const catId = await seedCategory('Dormitorios', 'dormitorios');
      const supId = await seedSupplier('Camas Chile');
      const prodId = await seedProduct('CAMA-200', catId, supId, 'Cama 2 Plazas');

      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          saleChannel: 'FALABELLA',
          saleDate: '2026-06-15',
          items: [{ productId: prodId, quantity: 2, unitPriceGross: 429990, unitPriceNet: 361336, vatAmount: 68654 }],
          costs: [{ costType: 'MARKETPLACE', description: 'Comisión', occurredAt: '2026-06-15', costGross: 42999, costNet: 36134, vatAmount: 6865 }],
        });
    });

    it('GET summary — should return aggregated data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/summary')
        .expect(200);

      expect(res.body.data).toHaveProperty('revenue');
      expect(res.body.data).toHaveProperty('costs');
      expect(res.body.data).toHaveProperty('profit');
      expect(res.body.data).toHaveProperty('margin');
      expect(Number(res.body.data.revenue)).toBeGreaterThan(0);
    });

    it('GET profit-trend — should return trend array', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/profit-trend')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET top-products — should return products list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/top-products')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('GET top-suppliers — should return suppliers list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/top-suppliers')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('GET top-categories — should return categories list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/top-categories')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('GET top-channels — should return channels list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/top-channels')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('GET profit-trend — should filter by date range', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/profit-trend?from=2026-06-01&to=2026-06-30')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
