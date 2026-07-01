import request from 'supertest';
import { getApp, cleanupDb, seedCategory, seedSupplier, seedProduct } from '../../helpers/e2e-setup';

describe('Profitability /api/v1/profitability', () => {
  let saleId: string;

  beforeAll(async () => {
    await getApp();
  });

  beforeEach(async () => {
    await cleanupDb();
    const catId = await seedCategory('Comedores', 'comedores');
    const supId = await seedSupplier('Muebles Comedor');
    const prodId = await seedProduct('MESA-001', catId, supId, 'Mesa 6 puestos');

    const app = await getApp();
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

  afterAll(async () => {
    await cleanupDb();
  });

  it('GET sales/:saleId — should return profitability snapshot', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .get(`/api/v1/profitability/sales/${saleId}`)
      .expect(200);

    expect(res.body.data).toHaveProperty('revenueNet');
    expect(res.body.data).toHaveProperty('profit');
    expect(res.body.data).toHaveProperty('marginPercentage');
  });

  it('POST sales/:saleId/recalculate — should recalculate snapshot', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .post(`/api/v1/profitability/sales/${saleId}/recalculate`)
      .expect(201);

    expect(res.body.data).toHaveProperty('profit');
    expect(Number(res.body.data.profit)).toBeGreaterThan(0);
  });
});
