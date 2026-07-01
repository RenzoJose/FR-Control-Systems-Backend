import request from 'supertest';
import { randomUUID } from 'crypto';
import { getApp, cleanupDb, seedCategory, seedSupplier, seedProduct } from '../../helpers/e2e-setup';

describe('Products /api/v1/products', () => {
  let catId: string;
  let supId: string;

  beforeAll(async () => {
    await getApp();
  });

  beforeEach(async () => {
    await cleanupDb();
    catId = await seedCategory('Dormitorios', 'dormitorios');
    supId = await seedSupplier('Fabrica Camas');
  });

  afterAll(async () => {
    await cleanupDb();
  });

  it('POST — should create a product', async () => {
    const app = await getApp();
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
    const app = await getApp();
    await seedProduct('SKU-001', catId, supId);

    const res = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET — should filter by categoryId', async () => {
    const app = await getApp();
    const otherCatId = await seedCategory('Cocina', 'cocina');
    await seedProduct('SKU-A', catId, supId);
    await seedProduct('SKU-B', otherCatId, supId);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/products?categoryId=${catId}`)
      .expect(200);

    expect(res.body.data.every((p: { categoryId: string }) => p.categoryId === catId)).toBe(true);
  });

  it('GET — should filter by supplierId', async () => {
    const app = await getApp();
    const otherSupId = await seedSupplier('Otro Proveedor');
    await seedProduct('SKU-C', catId, supId);
    await seedProduct('SKU-D', catId, otherSupId);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/products?supplierId=${supId}`)
      .expect(200);

    expect(res.body.data.every((p: { supplierId: string }) => p.supplierId === supId)).toBe(true);
  });

  it('GET — should search by name', async () => {
    const app = await getApp();
    await seedProduct('SKU-E', catId, supId, 'Sofá Milano');
    await seedProduct('SKU-F', catId, supId, 'Mesa Comedor');

    const res = await request(app.getHttpServer())
      .get('/api/v1/products?search=Milano')
      .expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toContain('Milano');
  });

  it('GET :id — should return product by id', async () => {
    const app = await getApp();
    const prodId = await seedProduct('SKU-G', catId, supId, 'Sillón Relax');

    const res = await request(app.getHttpServer())
      .get(`/api/v1/products/${prodId}`)
      .expect(200);

    expect(res.body.data.name).toBe('Sillón Relax');
  });

  it('GET :id — should 404 for nonexistent id', async () => {
    const app = await getApp();
    await request(app.getHttpServer())
      .get(`/api/v1/products/${randomUUID()}`)
      .expect(404);
  });

  it('PATCH :id — should update a product', async () => {
    const app = await getApp();
    const prodId = await seedProduct('SKU-H', catId, supId, 'Original');

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/products/${prodId}`)
      .send({ name: 'Updated Name', brand: 'NewBrand' })
      .expect(200);

    expect(res.body.data.name).toBe('Updated Name');
  });

  it('DELETE :id — should deactivate (soft-delete) product', async () => {
    const app = await getApp();
    const prodId = await seedProduct('SKU-I', catId, supId);

    await request(app.getHttpServer())
      .delete(`/api/v1/products/${prodId}`)
      .expect(204);
  });
});
