import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import { PrismaCategoryRepository } from '../src/modules/categories/infrastructure/repositories/prisma-category.repository';
import { Category } from '../src/modules/categories/domain/entities/category.entity';
import { PrismaSupplierRepository } from '../src/modules/suppliers/infrastructure/repositories/prisma-supplier.repository';
import { Supplier } from '../src/modules/suppliers/domain/entities/supplier.entity';
import { PrismaProductRepository } from '../src/modules/products/infrastructure/repositories/prisma-product.repository';
import { Product } from '../src/modules/products/domain/entities/product.entity';
import { PrismaSaleRepository } from '../src/modules/sales/infrastructure/repositories/prisma-sale.repository';
import { Sale } from '../src/modules/sales/domain/entities/sale.entity';
import { SaleItem } from '../src/modules/sales/domain/entities/sale-item.entity';
import { SaleCost } from '../src/modules/sales/domain/entities/sale-cost.entity';
import { PrismaSaleCostRepository } from '../src/modules/sale-costs/infrastructure/repositories/prisma-sale-cost.repository';
import { PrismaProfitabilityRepository } from '../src/modules/profitability/infrastructure/repositories/prisma-profitability.repository';
import { ProfitSnapshot } from '../src/modules/profitability/domain/entities/profit-snapshot.entity';

describe('Repositories (integration)', () => {
  let prisma: PrismaService;
  let categoryRepo: PrismaCategoryRepository;
  let supplierRepo: PrismaSupplierRepository;
  let productRepo: PrismaProductRepository;
  let saleRepo: PrismaSaleRepository;
  let saleCostRepo: PrismaSaleCostRepository;
  let profitabilityRepo: PrismaProfitabilityRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = module.get(PrismaService);
    categoryRepo = new PrismaCategoryRepository(prisma);
    supplierRepo = new PrismaSupplierRepository(prisma);
    productRepo = new PrismaProductRepository(prisma);
    saleRepo = new PrismaSaleRepository(prisma);
    saleCostRepo = new PrismaSaleCostRepository(prisma);
    profitabilityRepo = new PrismaProfitabilityRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
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

  // ── Category Repository ────────────────────────────────────
  describe('PrismaCategoryRepository', () => {
    it('create — should persist and return a category', async () => {
      const entity = new Category(randomUUID(), 'Living', 'living', 'Muebles de living');

      const result = await categoryRepo.create(entity);

      expect(result.id).toBe(entity.id);
      expect(result.name).toBe('Living');
    });

    it('findById — should return null for nonexistent id', async () => {
      const result = await categoryRepo.findById(randomUUID());

      expect(result).toBeNull();
    });

    it('findById — should return category by id', async () => {
      const entity = new Category(randomUUID(), 'Camas', 'camas');
      await categoryRepo.create(entity);

      const result = await categoryRepo.findById(entity.id);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Camas');
    });

    it('findAll — should return only non-deleted categories', async () => {
      await categoryRepo.create(new Category(randomUUID(), 'Activo'));
      const deleted = new Category(randomUUID(), 'Eliminado');
      await categoryRepo.create(deleted);
      await categoryRepo.deactivate(deleted.id);

      const { data: results } = await categoryRepo.findAll();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Activo');
    });

    it('update — should update category fields', async () => {
      const entity = new Category(randomUUID(), 'Original');
      await categoryRepo.create(entity);
      const updated = new Category(entity.id, 'Modificado', 'modificado', 'Nueva desc');

      const result = await categoryRepo.update(updated);

      expect(result.name).toBe('Modificado');
      expect(result.slug).toBe('modificado');

      const fetched = await categoryRepo.findById(entity.id);
      expect(fetched!.name).toBe('Modificado');
    });

    it('deactivate — should set deletedAt timestamp', async () => {
      const entity = new Category(randomUUID(), 'To Delete');
      await categoryRepo.create(entity);

      await categoryRepo.deactivate(entity.id);

      const result = await categoryRepo.findById(entity.id);
      expect(result).toBeNull();
    });
  });

  // ── Supplier Repository ────────────────────────────────────
  describe('PrismaSupplierRepository', () => {
    it('create — should persist supplier with all fields', async () => {
      const entity = new Supplier(randomUUID(), 'Muebles del Sur', 'Juan', '+5691', 'j@m.cl', 'Nota');

      const result = await supplierRepo.create(entity);

      expect(result.name).toBe('Muebles del Sur');
      expect(result.contactName).toBe('Juan');
      expect(result.phone).toBe('+5691');
      expect(result.email).toBe('j@m.cl');
      expect(result.notes).toBe('Nota');
    });

    it('findAll — should filter out soft-deleted suppliers', async () => {
      await supplierRepo.create(new Supplier(randomUUID(), 'Proveedor 1'));
      const s2 = new Supplier(randomUUID(), 'Proveedor 2');
      await supplierRepo.create(s2);
      await supplierRepo.deactivate(s2.id);

      const { data: results } = await supplierRepo.findAll();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Proveedor 1');
    });

    it('update — should persist changes', async () => {
      const entity = new Supplier(randomUUID(), 'Viejo Nombre');
      await supplierRepo.create(entity);

      await supplierRepo.update(new Supplier(entity.id, 'Nuevo Nombre', 'Nuevo Contacto'));

      const fetched = await supplierRepo.findById(entity.id);
      expect(fetched!.name).toBe('Nuevo Nombre');
      expect(fetched!.contactName).toBe('Nuevo Contacto');
    });

    it('deactivate — should soft-delete supplier', async () => {
      const entity = new Supplier(randomUUID(), 'Delete Me');
      await supplierRepo.create(entity);
      await supplierRepo.deactivate(entity.id);

      expect(await supplierRepo.findById(entity.id)).toBeNull();
    });
  });

  // ── Product Repository ─────────────────────────────────────
  describe('PrismaProductRepository', () => {
    let catId: string;
    let supId: string;

    beforeEach(async () => {
      catId = (await categoryRepo.create(new Category(randomUUID(), 'Dormitorios'))).id;
      supId = (await supplierRepo.create(new Supplier(randomUUID(), 'Fabricante Test'))).id;
    });

    it('create — should persist product with relations', async () => {
      const entity = new Product(randomUUID(), 'CAMA-X', 'Cama King', catId, supId, 'Flex');

      const result = await productRepo.create(entity);

      expect(result.sku).toBe('CAMA-X');
      expect(result.name).toBe('Cama King');
    });

    it('findAll — should filter by categoryId', async () => {
      await productRepo.create(new Product(randomUUID(), 'A-1', 'Prod A', catId, supId));
      const otherCatId = (await categoryRepo.create(new Category(randomUUID(), 'Cocina'))).id;
      await productRepo.create(new Product(randomUUID(), 'B-1', 'Prod B', otherCatId, supId));

      const { data: results } = await productRepo.findAll({ categoryId: catId });

      expect(results).toHaveLength(1);
      expect(results[0].sku).toBe('A-1');
    });

    it('findAll — should filter by supplierId', async () => {
      await productRepo.create(new Product(randomUUID(), 'C-1', 'Prod C', catId, supId));
      const otherSupId = (await supplierRepo.create(new Supplier(randomUUID(), 'Otro Fab'))).id;
      await productRepo.create(new Product(randomUUID(), 'D-1', 'Prod D', catId, otherSupId));

      const { data: results } = await productRepo.findAll({ supplierId: supId });

      expect(results).toHaveLength(1);
    });

    it('findAll — should search by name (case-insensitive)', async () => {
      await productRepo.create(new Product(randomUUID(), 'S-001', 'Sofá Milano', catId, supId));
      await productRepo.create(new Product(randomUUID(), 'M-001', 'Mesa Comedor', catId, supId));

      const { data: results } = await productRepo.findAll({ search: 'milano' });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Sofá Milano');
    });

    it('findAll — should search by sku', async () => {
      await productRepo.create(new Product(randomUUID(), 'SOFA-001', 'Sofá', catId, supId));

      const { data: results } = await productRepo.findAll({ search: 'SOFA-001' });

      expect(results).toHaveLength(1);
    });

    it('findAll — should exclude soft-deleted', async () => {
      const p1 = new Product(randomUUID(), 'OK', 'Válido', catId, supId);
      const p2 = new Product(randomUUID(), 'DEL', 'Eliminado', catId, supId);
      await productRepo.create(p1);
      await productRepo.create(p2);
      await productRepo.deactivate(p2.id);

      const { data: results } = await productRepo.findAll();

      expect(results).toHaveLength(1);
    });

    it('update — should persist changes', async () => {
      const entity = new Product(randomUUID(), 'SKU-1', 'Original', catId, supId, 'BrandA');
      await productRepo.create(entity);

      await productRepo.update(new Product(entity.id, 'SKU-2', 'Updated', catId, supId, 'BrandB'));

      const fetched = await productRepo.findById(entity.id);
      expect(fetched!.name).toBe('Updated');
      expect(fetched!.sku).toBe('SKU-2');
    });

    it('deactivate — should soft-delete product', async () => {
      const entity = new Product(randomUUID(), 'DEL-SKU', 'Delete', catId, supId);
      await productRepo.create(entity);
      await productRepo.deactivate(entity.id);

      expect(await productRepo.findById(entity.id)).toBeNull();
    });
  });

  // ── Sale Repository ────────────────────────────────────────
  describe('PrismaSaleRepository', () => {
    let catId: string;
    let supId: string;
    let prodId: string;

    beforeEach(async () => {
      catId = (await categoryRepo.create(new Category(randomUUID(), 'Living'))).id;
      supId = (await supplierRepo.create(new Supplier(randomUUID(), 'Sup Test'))).id;
      prodId = (await productRepo.create(new Product(randomUUID(), 'S-001', 'Sofá', catId, supId))).id;
    });

    it('create — should persist sale with items and costs', async () => {
      const now = new Date();
      const items = [new SaleItem(randomUUID(), 'sale-id-temp', prodId, 2, 349990, 294109, 55881, now)];
      const costs = [new SaleCost(randomUUID(), 'sale-id-temp', 'TRANSPORT', 'Flete', now, 15000, 12605, 2395, now, now)];
      const sale = new Sale(randomUUID(), 'FALABELLA', now, now, now, undefined, items, costs);

      const result = await saleRepo.create(sale);

      expect(result.id).toBe(sale.id);
      expect(result.saleChannel).toBe('FALABELLA');
      expect(result.items).toHaveLength(1);
      expect(result.costs).toHaveLength(1);
    });

    it('findById — should return sale with items and costs (no deleted costs)', async () => {
      const now = new Date();
      const saleId = randomUUID();
      const items = [new SaleItem(randomUUID(), saleId, prodId, 1, 1000, 840, 160, now)];
      const sale = new Sale(saleId, 'DIRECT', now, now, now, undefined, items, []);
      await saleRepo.create(sale);

      const result = await saleRepo.findById(saleId);

      expect(result).not.toBeNull();
      expect(result!.items).toHaveLength(1);
    });

    it('findById — should return null for nonexistent id', async () => {
      const result = await saleRepo.findById(randomUUID());

      expect(result).toBeNull();
    });

    it('findAll — should filter by channel', async () => {
      const now = new Date();
      await saleRepo.create(new Sale(randomUUID(), 'FALABELLA', now, now, now, undefined, [
        new SaleItem(randomUUID(), '', prodId, 1, 1000, 840, 160, now),
      ], []));
      await saleRepo.create(new Sale(randomUUID(), 'DIRECT', now, now, now, undefined, [
        new SaleItem(randomUUID(), '', prodId, 1, 1000, 840, 160, now),
      ], []));

      const { data: results } = await saleRepo.findAll({ channel: 'FALABELLA' });

      expect(results).toHaveLength(1);
      expect(results[0].saleChannel).toBe('FALABELLA');
    });

    it('findAll — should filter by date range', async () => {
      const now = new Date();
      await saleRepo.create(new Sale(randomUUID(), 'FALABELLA', new Date('2026-06-01'), now, now, undefined, [
        new SaleItem(randomUUID(), '', prodId, 1, 1000, 840, 160, now),
      ], []));
      await saleRepo.create(new Sale(randomUUID(), 'FALABELLA', new Date('2026-07-01'), now, now, undefined, [
        new SaleItem(randomUUID(), '', prodId, 1, 1000, 840, 160, now),
      ], []));

      const { data: results } = await saleRepo.findAll({ dateFrom: '2026-06-15', dateTo: '2026-07-15' });

      expect(results).toHaveLength(1);
    });
  });

  // ── Sale Cost Repository ───────────────────────────────────
  describe('PrismaSaleCostRepository', () => {
    let saleId: string;

    beforeEach(async () => {
      const catId = (await categoryRepo.create(new Category(randomUUID(), 'Test'))).id;
      const supId = (await supplierRepo.create(new Supplier(randomUUID(), 'Sup'))).id;
      const prodId = (await productRepo.create(new Product(randomUUID(), 'P-1', 'Producto', catId, supId))).id;
      const now = new Date();
      const items = [new SaleItem(randomUUID(), 'tmp', prodId, 1, 1000, 840, 160, now)];
      const sale = new Sale(randomUUID(), 'DIRECT', now, now, now, undefined, items, []);
      saleId = (await saleRepo.create(sale)).id;
    });

    it('create — should persist a cost linked to sale', async () => {
      const entity = new SaleCost(randomUUID(), saleId, 'TRANSPORT', 'Flete', new Date(), 15000, 12605, 2395, new Date(), new Date());

      const result = await saleCostRepo.create(entity);

      expect(result.id).toBe(entity.id);
      expect(result.costType).toBe('TRANSPORT');
    });

    it('findAllBySaleId — should return only non-deleted costs', async () => {
      const c1 = new SaleCost(randomUUID(), saleId, 'TRANSPORT', 'Costo 1', new Date(), 100, 84, 16, new Date(), new Date());
      const c2 = new SaleCost(randomUUID(), saleId, 'ADVERTISING', 'Costo 2', new Date(), 200, 168, 32, new Date(), new Date());
      await saleCostRepo.create(c1);
      await saleCostRepo.create(c2);
      await saleCostRepo.deactivate(c2.id);

      const { data: results } = await saleCostRepo.findAllBySaleId(saleId);

      expect(results).toHaveLength(1);
      expect(results[0].description).toBe('Costo 1');
    });

    it('update — should persist changes', async () => {
      const entity = new SaleCost(randomUUID(), saleId, 'TRANSPORT', 'Original', new Date(), 100, 84, 16, new Date(), new Date());
      await saleCostRepo.create(entity);

      const updated = new SaleCost(entity.id, saleId, 'MARKETPLACE', 'Updated', new Date(), 200, 168, 32, new Date(), new Date());
      const result = await saleCostRepo.update(updated);

      expect(result.costType).toBe('MARKETPLACE');
      expect(result.costNet).toBe(168);
    });

    it('deactivate — should soft-delete cost', async () => {
      const entity = new SaleCost(randomUUID(), saleId, 'OTHER', 'Delete', new Date(), 100, 84, 16, new Date(), new Date());
      await saleCostRepo.create(entity);
      await saleCostRepo.deactivate(entity.id);

      expect(await saleCostRepo.findById(entity.id)).toBeNull();
    });
  });

  // ── Profitability Repository ───────────────────────────────
  describe('PrismaProfitabilityRepository', () => {
    let saleId: string;

    beforeEach(async () => {
      const catId = (await categoryRepo.create(new Category(randomUUID(), 'Test'))).id;
      const supId = (await supplierRepo.create(new Supplier(randomUUID(), 'Sup'))).id;
      const prodId = (await productRepo.create(new Product(randomUUID(), 'P-1', 'Prod', catId, supId))).id;
      const now = new Date();
      const items = [new SaleItem(randomUUID(), 'tmp', prodId, 1, 1000, 840, 160, now)];
      const sale = new Sale(randomUUID(), 'DIRECT', now, now, now, undefined, items, []);
      saleId = (await saleRepo.create(sale)).id;
    });

    it('findBySaleId — should return null when no snapshot exists', async () => {
      const result = await profitabilityRepo.findBySaleId(randomUUID());

      expect(result).toBeNull();
    });

    it('upsert — should create a new snapshot', async () => {
      const now = new Date();
      const snapshot = new ProfitSnapshot(saleId, 1000, 200, 800, 80, now);

      const result = await profitabilityRepo.upsert(snapshot);

      expect(result.saleId).toBe(saleId);
      expect(result.profit).toBe(800);
    });

    it('upsert — should update an existing snapshot', async () => {
      const now = new Date();
      await profitabilityRepo.upsert(new ProfitSnapshot(saleId, 1000, 200, 800, 80, now));

      const updated = await profitabilityRepo.upsert(new ProfitSnapshot(saleId, 2000, 500, 1500, 75, now));

      expect(updated.revenueNet).toBe(2000);
      expect(updated.profit).toBe(1500);
    });

    it('findBySaleId — should return the snapshot after upsert', async () => {
      const now = new Date();
      await profitabilityRepo.upsert(new ProfitSnapshot(saleId, 5000, 1000, 4000, 80, now));

      const result = await profitabilityRepo.findBySaleId(saleId);

      expect(result).not.toBeNull();
      expect(result!.revenueNet).toBe(5000);
    });
  });
});
