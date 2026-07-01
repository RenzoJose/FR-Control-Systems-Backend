import request from 'supertest';
import { randomUUID } from 'crypto';
import { getApp, cleanupDb, seedCategory } from '../../helpers/e2e-setup';

describe('Categories /api/v1/categories', () => {
  beforeAll(async () => {
    await getApp();
  });

  beforeEach(async () => {
    await cleanupDb();
  });

  afterAll(async () => {
    await cleanupDb();
  });

  it('POST — should create a category', async () => {
    const app = await getApp();
    const res = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .send({ name: 'Living', slug: 'living', description: 'Muebles de living' })
      .expect(201);

    expect(res.body.data).toHaveProperty('id');
  });

  it('GET — should list categories', async () => {
    const app = await getApp();
    await seedCategory();

    const res = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET :id — should return category by id', async () => {
    const app = await getApp();
    const id = await seedCategory('Sommiers', 'sommiers');

    const res = await request(app.getHttpServer())
      .get(`/api/v1/categories/${id}`)
      .expect(200);

    expect(res.body.data.name).toBe('Sommiers');
  });

  it('GET :id — should 404 for nonexistent id', async () => {
    const app = await getApp();
    await request(app.getHttpServer())
      .get(`/api/v1/categories/${randomUUID()}`)
      .expect(404);
  });

  it('PATCH :id — should update a category', async () => {
    const app = await getApp();
    const id = await seedCategory('Original', 'original');

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/categories/${id}`)
      .send({ name: 'Updated', description: 'Nueva descripción' })
      .expect(200);

    expect(res.body.data.name).toBe('Updated');
  });

  it('DELETE :id — should deactivate (soft-delete) category', async () => {
    const app = await getApp();
    const id = await seedCategory('To Delete');

    await request(app.getHttpServer())
      .delete(`/api/v1/categories/${id}`)
      .expect(204);
  });
});
