import 'dotenv/config';
import { randomUUID } from 'crypto';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../../generated/prisma/client';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ── Cleanup existing data (reverse dependency order) ────────
  console.log('  Cleaning existing data...');
  await prisma.saleProfitSnapshot.deleteMany();
  await prisma.saleCost.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();

  // ── Categories ──────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: { id: randomUUID(), name: 'Camas y Sommiers', slug: 'camas-sommiers', description: 'Camas, sommiers, colchones y bases' },
    }),
    prisma.category.create({
      data: { id: randomUUID(), name: 'Living y Sofás', slug: 'living-sofas', description: 'Sofás, sillones, mesas de centro y living completo' },
    }),
    prisma.category.create({
      data: { id: randomUUID(), name: 'Comedores', slug: 'comedores', description: 'Mesas, sillas, bancas y comedores completos' },
    }),
    prisma.category.create({
      data: { id: randomUUID(), name: 'Dormitorios', slug: 'dormitorios', description: 'Veladores, cómodas, closets y muebles de dormitorio' },
    }),
    prisma.category.create({
      data: { id: randomUUID(), name: 'Oficina y Escritorios', slug: 'oficina-escritorios', description: 'Escritorios, sillas de oficina y estanterías' },
    }),
  ]);
  console.log(`  ✓ ${categories.length} categories created`);

  // ── Suppliers ──────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        id: randomUUID(),
        name: 'Muebles del Sur SpA.',
        contactName: 'Carlos Muñoz',
        phone: '+56 2 2345 6789',
        email: 'carlos@mueblesdelsur.cl',
        notes: 'Fabricante nacional de muebles de pino y melamina',
      },
    }),
    prisma.supplier.create({
      data: {
        id: randomUUID(),
        name: 'Importadora Hogar Chile Ltda.',
        contactName: 'María González',
        phone: '+56 2 2987 6543',
        email: 'maria@hogarchile.cl',
        notes: 'Importador de muebles brasileños y chinos',
      },
    }),
    prisma.supplier.create({
      data: {
        id: randomUUID(),
        name: 'Diseño & Madera SA',
        contactName: 'Pedro Ramírez',
        phone: '+56 2 2123 4567',
        email: 'pedro@disenoymadera.cl',
        notes: 'Muebles de diseño en madera nativa',
      },
    }),
    prisma.supplier.create({
      data: {
        id: randomUUID(),
        name: 'Colchones y Descanso Limitada',
        contactName: 'Ana Soto',
        phone: '+56 2 2765 4321',
        email: 'ana@colchonesdescanso.cl',
        notes: 'Especialistas en colchones y sommiers',
      },
    }),
  ]);
  console.log(`  ✓ ${suppliers.length} suppliers created`);

  // ── Products ────────────────────────────────────────────────
  const productsData = [
    { sku: 'CAMA-001', name: 'Sommier King Size 2 plazas', brand: 'Rosen', categoryIdx: 0, supplierIdx: 3 },
    { sku: 'CAMA-002', name: 'Base de cama 1 plaza madera', brand: 'Muebles del Sur', categoryIdx: 0, supplierIdx: 0 },
    { sku: 'CAMA-003', name: 'Colchón viscoelástico Queen', brand: 'Colchones y Descanso', categoryIdx: 0, supplierIdx: 3 },
    { sku: 'CAMA-004', name: 'Colchón ortopédico 1 plaza', brand: 'Colchones y Descanso', categoryIdx: 0, supplierIdx: 3 },
    { sku: 'LIV-001', name: 'Sofá chenille 3 cuerpos', brand: 'Hogar Chile', categoryIdx: 1, supplierIdx: 1 },
    { sku: 'LIV-002', name: 'Sillón relax reclinable', brand: 'Diseño & Madera', categoryIdx: 1, supplierIdx: 2 },
    { sku: 'LIV-003', name: 'Mesa de centro vidrio 120cm', brand: 'Hogar Chile', categoryIdx: 1, supplierIdx: 1 },
    { sku: 'LIV-004', name: 'Estante modular living 5 niveles', brand: 'Muebles del Sur', categoryIdx: 1, supplierIdx: 0 },
    { sku: 'COM-001', name: 'Mesa comedor 6 puestos vidrio', brand: 'Diseño & Madera', categoryIdx: 2, supplierIdx: 2 },
    { sku: 'COM-002', name: 'Silla comedor tapizada loto 4 unid.', brand: 'Hogar Chile', categoryIdx: 2, supplierIdx: 1 },
    { sku: 'COM-003', name: 'Banca comedor 1.20m', brand: 'Muebles del Sur', categoryIdx: 2, supplierIdx: 0 },
    { sku: 'DORM-001', name: 'Velador moderno con cajón', brand: 'Muebles del Sur', categoryIdx: 3, supplierIdx: 0 },
    { sku: 'DORM-002', name: 'Cómoda 6 cajones melamina', brand: 'Hogar Chile', categoryIdx: 3, supplierIdx: 1 },
    { sku: 'DORM-003', name: 'Closet 2 puertas corredizas', brand: 'Muebles del Sur', categoryIdx: 3, supplierIdx: 0 },
    { sku: 'OFI-001', name: 'Escritorio en L 1.50m', brand: 'Diseño & Madera', categoryIdx: 4, supplierIdx: 2 },
    { sku: 'OFI-002', name: 'Silla oficina ergonómica', brand: 'Hogar Chile', categoryIdx: 4, supplierIdx: 1 },
  ];

  const products = await Promise.all(
    productsData.map((p) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          categoryId: categories[p.categoryIdx].id,
          supplierId: suppliers[p.supplierIdx].id,
        },
      }),
    ),
  );
  console.log(`  ✓ ${products.length} products created`);

  // ── Sales ──────────────────────────────────────────────────
  const now = new Date();
  const salesData = [
    {
      saleChannel: 'FALABELLA' as const,
      saleDate: new Date('2026-05-15'),
      items: [
        { productIdx: 0, quantity: 3, unitPriceGross: 429990, unitPriceNet: 361336, vatAmount: 68654 },
        { productIdx: 3, quantity: 5, unitPriceGross: 189990, unitPriceNet: 159655, vatAmount: 30335 },
      ],
      costs: [
        { costType: 'MARKETPLACE' as const, description: 'Comisión Falabella', costGross: 85000, costNet: 71429, vatAmount: 13571, occurredAt: new Date('2026-05-15') },
        { costType: 'TRANSPORT' as const, description: 'Envío a bodega Falabella', costGross: 35000, costNet: 29412, vatAmount: 5588, occurredAt: new Date('2026-05-14') },
      ],
    },
    {
      saleChannel: 'MERCADO_LIBRE' as const,
      saleDate: new Date('2026-05-20'),
      items: [
        { productIdx: 4, quantity: 2, unitPriceGross: 349990, unitPriceNet: 294109, vatAmount: 55881 },
        { productIdx: 6, quantity: 4, unitPriceGross: 129990, unitPriceNet: 109235, vatAmount: 20755 },
      ],
      costs: [
        { costType: 'MARKETPLACE' as const, description: 'Comisión Mercado Libre', costGross: 95996, costNet: 80669, vatAmount: 15327, occurredAt: new Date('2026-05-20') },
        { costType: 'ADVERTISING' as const, description: 'Campaña ML Mayo', costGross: 35000, costNet: 29412, vatAmount: 5588, occurredAt: new Date('2026-05-10') },
      ],
    },
    {
      saleChannel: 'DIRECT' as const,
      saleDate: new Date('2026-06-01'),
      items: [
        { productIdx: 5, quantity: 1, unitPriceGross: 449990, unitPriceNet: 378143, vatAmount: 71847 },
        { productIdx: 8, quantity: 1, unitPriceGross: 329990, unitPriceNet: 277303, vatAmount: 52687 },
        { productIdx: 11, quantity: 4, unitPriceGross: 69990, unitPriceNet: 58824, vatAmount: 11166 },
      ],
      costs: [
        { costType: 'SUPPLIER' as const, description: 'Costo producto sillón relax', costGross: 250000, costNet: 210084, vatAmount: 39916, occurredAt: new Date('2026-05-25') },
        { costType: 'TRANSPORT' as const, description: 'Flete a cliente', costGross: 25000, costNet: 21008, vatAmount: 3992, occurredAt: new Date('2026-06-01') },
      ],
    },
    {
      saleChannel: 'RIPLEY' as const,
      saleDate: new Date('2026-06-05'),
      items: [
        { productIdx: 1, quantity: 8, unitPriceGross: 159990, unitPriceNet: 134454, vatAmount: 25536 },
        { productIdx: 9, quantity: 12, unitPriceGross: 259990, unitPriceNet: 218479, vatAmount: 41511 },
      ],
      costs: [
        { costType: 'MARKETPLACE' as const, description: 'Comisión Ripley', costGross: 100990, costNet: 84866, vatAmount: 16124, occurredAt: new Date('2026-06-05') },
        { costType: 'ADVERTISING' as const, description: 'Publicación destacada', costGross: 25000, costNet: 21008, vatAmount: 3992, occurredAt: new Date('2026-06-01') },
        { costType: 'TRANSPORT' as const, description: 'Envío a tiendas Ripley', costGross: 48000, costNet: 40336, vatAmount: 7664, occurredAt: new Date('2026-06-04') },
      ],
    },
    {
      saleChannel: 'CUSTOM' as const,
      saleDate: new Date('2026-06-10'),
      items: [
        { productIdx: 2, quantity: 6, unitPriceGross: 249990, unitPriceNet: 210076, vatAmount: 39914 },
        { productIdx: 7, quantity: 4, unitPriceGross: 139990, unitPriceNet: 117639, vatAmount: 22351 },
        { productIdx: 14, quantity: 2, unitPriceGross: 249990, unitPriceNet: 210076, vatAmount: 39914 },
      ],
      costs: [
        { costType: 'SUPPLIER' as const, description: 'Costo productos pedido corporativo', costGross: 450000, costNet: 378151, vatAmount: 71849, occurredAt: new Date('2026-06-08') },
        { costType: 'TRANSPORT' as const, description: 'Despacho a oficinas cliente', costGross: 35000, costNet: 29412, vatAmount: 5588, occurredAt: new Date('2026-06-09') },
      ],
    },
    {
      saleChannel: 'FALABELLA' as const,
      saleDate: new Date('2026-06-15'),
      items: [
        { productIdx: 10, quantity: 6, unitPriceGross: 89990, unitPriceNet: 75622, vatAmount: 14368 },
        { productIdx: 13, quantity: 3, unitPriceGross: 289990, unitPriceNet: 243689, vatAmount: 46301 },
      ],
      costs: [
        { costType: 'MARKETPLACE' as const, description: 'Comisión Falabella', costGross: 65994, costNet: 55457, vatAmount: 10537, occurredAt: new Date('2026-06-15') },
        { costType: 'TRANSPORT' as const, description: 'Envío express', costGross: 25000, costNet: 21008, vatAmount: 3992, occurredAt: new Date('2026-06-14') },
      ],
    },
  ];

  for (const saleData of salesData) {
    const saleId = randomUUID();
    const saleItems = saleData.items.map((item) => ({
      id: randomUUID(),
      productId: products[item.productIdx].id,
      quantity: item.quantity,
      unitPriceGross: item.unitPriceGross,
      unitPriceNet: item.unitPriceNet,
      vatAmount: item.vatAmount,
      createdAt: now,
    }));

    const saleCosts = saleData.costs.map((cost) => ({
      id: randomUUID(),
      costType: cost.costType,
      description: cost.description,
      occurredAt: cost.occurredAt,
      costGross: cost.costGross,
      costNet: cost.costNet,
      vatAmount: cost.vatAmount,
      createdAt: now,
      updatedAt: now,
    }));

    const revenueNet = saleItems.reduce((sum, i) => sum + i.unitPriceNet * i.quantity, 0);
    const totalCostNet = saleCosts.reduce((sum, c) => sum + c.costNet, 0);
    const profit = revenueNet - totalCostNet;
    const marginPercentage = revenueNet > 0 ? parseFloat(((profit / revenueNet) * 100).toFixed(2)) : 0;

    await prisma.sale.create({
      data: {
        id: saleId,
        saleChannel: saleData.saleChannel,
        saleDate: saleData.saleDate,
        createdAt: now,
        updatedAt: now,
        items: { createMany: { data: saleItems } },
        costs: { createMany: { data: saleCosts } },
        profitSnapshot: {
          create: {
            revenueNet,
            totalCostNet,
            profit,
            marginPercentage,
            createdAt: now,
          },
        },
      },
    });
  }
  console.log(`  ✓ ${salesData.length} sales with items, costs & profit snapshots created`);

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
