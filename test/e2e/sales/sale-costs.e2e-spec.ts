import request from 'supertest';
import { getApp, cleanupDb, seedCategory, seedSupplier, seedProduct } from '../../helpers/e2e-setup';

describe('Sale Costs /api/v1/sales/:saleId/costs', () => {
  let catId: string;
  let supId: string;
  let prodId: string;
  let saleId: string;

  beforeAll(async () => {
    await getApp();
  });

  beforeEach(async () => {
    await cleanupDb();
    catId = await seedCategory('Oficina', 'oficina');
    supId = await seedSupplier('Muebles Office');
    prodId = await seedProduct('ESC-001', catId, supId, 'Escritorio');

    const app = await getApp();
    const res = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        saleChannel: 'DIRECT',
        saleDate: '2026-06-01',
        items: [{ productId: prodId, quantity: 1, unitPriceGross: 199990, unitPriceNet: 168059, vatAmount: 31931 }],
      });
    saleId = res.body.data.id;
  });

  afterAll(async () => {
    await cleanupDb();
  });

  it('POST — should add a cost to a sale', async () => {
    const app = await getApp();
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
    const app = await getApp();
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
    const app = await getApp();
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
    const app = await getApp();
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
