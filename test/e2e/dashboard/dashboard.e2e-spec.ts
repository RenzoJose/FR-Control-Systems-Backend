import request from 'supertest';
import { getApp, cleanupDb, seedCategory, seedSupplier, seedProduct } from '../../helpers/e2e-setup';

describe('Dashboard /api/v1/dashboard', () => {
  beforeAll(async () => {
    await getApp();
  });

  beforeEach(async () => {
    await cleanupDb();
    const catId = await seedCategory('Dormitorios', 'dormitorios');
    const supId = await seedSupplier('Camas Chile');
    const prodId = await seedProduct('CAMA-200', catId, supId, 'Cama 2 Plazas');

    const app = await getApp();
    await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        saleChannel: 'FALABELLA',
        saleDate: '2026-06-15',
        items: [{ productId: prodId, quantity: 2, unitPriceGross: 429990, unitPriceNet: 361336, vatAmount: 68654 }],
        costs: [{ costType: 'MARKETPLACE', description: 'Comisión', occurredAt: '2026-06-15', costGross: 42999, costNet: 36134, vatAmount: 6865 }],
      });
  });

  afterAll(async () => {
    await cleanupDb();
  });

  it('GET summary — should return aggregated data', async () => {
    const app = await getApp();
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
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/profit-trend')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET top-products — should return products list', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/top-products')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET top-suppliers — should return suppliers list', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/top-suppliers')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET top-categories — should return categories list', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/top-categories')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET top-channels — should return channels list', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/top-channels')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET profit-trend — should filter by date range', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/profit-trend?from=2026-06-01&to=2026-06-30')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
  });
});
