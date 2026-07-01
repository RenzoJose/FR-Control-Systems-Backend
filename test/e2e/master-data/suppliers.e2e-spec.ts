import request from 'supertest';
import { randomUUID } from 'crypto';
import { getApp, cleanupDb, seedSupplier } from '../../helpers/e2e-setup';

describe('Suppliers /api/v1/suppliers', () => {
  beforeAll(async () => {
    await getApp();
  });

  beforeEach(async () => {
    await cleanupDb();
  });

  afterAll(async () => {
    await cleanupDb();
  });

  it('POST — should create a supplier', async () => {
    const app = await getApp();
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
    const app = await getApp();
    await seedSupplier();

    const res = await request(app.getHttpServer())
      .get('/api/v1/suppliers')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET :id — should return supplier by id', async () => {
    const app = await getApp();
    const id = await seedSupplier('Unique Supplier');

    const res = await request(app.getHttpServer())
      .get(`/api/v1/suppliers/${id}`)
      .expect(200);

    expect(res.body.data.name).toBe('Unique Supplier');
  });

  it('GET :id — should 404 for nonexistent id', async () => {
    const app = await getApp();
    await request(app.getHttpServer())
      .get(`/api/v1/suppliers/${randomUUID()}`)
      .expect(404);
  });

  it('PATCH :id — should update a supplier', async () => {
    const app = await getApp();
    const id = await seedSupplier('Old Name');

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${id}`)
      .send({ name: 'New Name', phone: '+56987654321' })
      .expect(200);

    expect(res.body.data.name).toBe('New Name');
    expect(res.body.data.phone).toBe('+56987654321');
  });

  it('DELETE :id — should deactivate (soft-delete) supplier', async () => {
    const app = await getApp();
    const id = await seedSupplier('To Delete');

    await request(app.getHttpServer())
      .delete(`/api/v1/suppliers/${id}`)
      .expect(204);
  });
});
