import request from 'supertest';
import { randomUUID } from 'crypto';
import { getApp, cleanupDb, seedCategory, seedSupplier, seedProduct } from '../../helpers/e2e-setup';

describe('Sales /api/v1/sales', () => {
  let catId: string;
  let supId: string;
  let prodId: string;

  beforeAll(async () => {
    await getApp();
  });

  beforeEach(async () => {
    await cleanupDb();
    catId = await seedCategory('Living', 'living');
    supId = await seedSupplier('Muebles Chic');
    prodId = await seedProduct('SOFA-001', catId, supId, 'Sofá 3 Cuerpos');
  });

  afterAll(async () => {
    await cleanupDb();
  });

  it('POST — should create a sale with items and profit snapshot', async () => {
    const app = await getApp();
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

    const snapRes = await request(app.getHttpServer())
      .get(`/api/v1/profitability/sales/${res.body.data.id}`)
      .expect(200);

    expect(snapRes.body.data).toHaveProperty('profit');
    expect(Number(snapRes.body.data.profit)).toBeGreaterThan(0);
  });

  it('POST — should create a sale without costs', async () => {
    const app = await getApp();
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
    const app = await getApp();
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
    const app = await getApp();
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
    const app = await getApp();
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
    const app = await getApp();
    await request(app.getHttpServer())
      .get(`/api/v1/sales/${randomUUID()}`)
      .expect(404);
  });

  it('PATCH :id — should update sale channel and date', async () => {
    const app = await getApp();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        saleChannel: 'FALABELLA',
        saleDate: '2026-06-15',
        items: [{ productId: prodId, quantity: 1, unitPriceGross: 1000, unitPriceNet: 840, vatAmount: 160 }],
      });
    const saleId = createRes.body.data.id;

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/sales/${saleId}`)
      .send({ saleChannel: 'DIRECT', saleDate: '2026-07-01' })
      .expect(200);

    expect(res.body.data.saleChannel).toBe('DIRECT');
    expect(res.body.data.saleDate).toBe('2026-07-01T00:00:00.000Z');
  });

  it('PATCH :id — should replace items and recalculate profit', async () => {
    const app = await getApp();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        saleChannel: 'DIRECT',
        saleDate: '2026-06-01',
        items: [{ productId: prodId, quantity: 1, unitPriceGross: 1000, unitPriceNet: 840, vatAmount: 160 }],
      });
    const saleId = createRes.body.data.id;

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/sales/${saleId}`)
      .send({
        items: [{ productId: prodId, quantity: 3, unitPriceGross: 3000, unitPriceNet: 2521, vatAmount: 479 }],
      })
      .expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(3);

    const snapRes = await request(app.getHttpServer())
      .get(`/api/v1/profitability/sales/${saleId}`)
      .expect(200);

    expect(Number(snapRes.body.data.revenueNet)).toBe(7563);
  });

  it('PATCH :id — should replace costs and recalculate profit', async () => {
    const app = await getApp();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        saleChannel: 'DIRECT',
        saleDate: '2026-06-01',
        items: [{ productId: prodId, quantity: 1, unitPriceGross: 500000, unitPriceNet: 420168, vatAmount: 79832 }],
      });
    const saleId = createRes.body.data.id;

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/sales/${saleId}`)
      .send({
        costs: [{
          costType: 'TRANSPORT',
          description: 'Flete express',
          occurredAt: '2026-06-02',
          costGross: 50000,
          costNet: 42017,
          vatAmount: 7983,
        }],
      })
      .expect(200);

    expect(res.body.data.costs).toHaveLength(1);
    expect(res.body.data.costs[0].costNet).toBe(42017);
  });

  it('PATCH :id — should update everything at once', async () => {
    const app = await getApp();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        saleChannel: 'FALABELLA',
        saleDate: '2026-06-10',
        items: [{ productId: prodId, quantity: 1, unitPriceGross: 1000, unitPriceNet: 840, vatAmount: 160 }],
        costs: [{ costType: 'MARKETPLACE', description: 'Comisión', occurredAt: '2026-06-10', costGross: 100, costNet: 84, vatAmount: 16 }],
      });
    const saleId = createRes.body.data.id;

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/sales/${saleId}`)
      .send({
        saleChannel: 'RIPLEY',
        saleDate: '2026-07-15',
        items: [{ productId: prodId, quantity: 2, unitPriceGross: 2000, unitPriceNet: 1681, vatAmount: 319 }],
        costs: [{ costType: 'TRANSPORT', description: 'Flete', occurredAt: '2026-07-15', costGross: 200, costNet: 168, vatAmount: 32 }],
      })
      .expect(200);

    expect(res.body.data.saleChannel).toBe('RIPLEY');
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.costs).toHaveLength(1);
  });

  it('PATCH :id — should 404 for nonexistent sale', async () => {
    const app = await getApp();
    await request(app.getHttpServer())
      .patch(`/api/v1/sales/${randomUUID()}`)
      .send({ saleChannel: 'DIRECT' })
      .expect(404);
  });

  it('PATCH :id — should reject invalid saleChannel', async () => {
    const app = await getApp();
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .send({
        saleChannel: 'DIRECT',
        saleDate: '2026-06-01',
        items: [{ productId: prodId, quantity: 1, unitPriceGross: 1000, unitPriceNet: 840, vatAmount: 160 }],
      });
    const saleId = createRes.body.data.id;

    await request(app.getHttpServer())
      .patch(`/api/v1/sales/${saleId}`)
      .send({ saleChannel: 'INVALID' })
      .expect(400);
  });
});
