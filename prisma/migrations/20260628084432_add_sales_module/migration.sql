-- CreateEnum
CREATE TYPE "sale_channel" AS ENUM ('DIRECT', 'FALABELLA', 'MERCADO_LIBRE', 'RIPLEY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "cost_type" AS ENUM ('SUPPLIER', 'TRANSPORT', 'MARKETPLACE', 'ADVERTISING', 'OTHER');

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "saleChannel" "sale_channel" NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceGross" DECIMAL(12,2) NOT NULL,
    "unitPriceNet" DECIMAL(12,2) NOT NULL,
    "vatAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_costs" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "costType" "cost_type" NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "costGross" DECIMAL(12,2) NOT NULL,
    "costNet" DECIMAL(12,2) NOT NULL,
    "vatAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sale_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_profit_snapshots" (
    "saleId" TEXT NOT NULL,
    "revenueNet" DECIMAL(12,2) NOT NULL,
    "totalCostNet" DECIMAL(12,2) NOT NULL,
    "profit" DECIMAL(12,2) NOT NULL,
    "marginPercentage" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_profit_snapshots_pkey" PRIMARY KEY ("saleId")
);

-- CreateIndex
CREATE INDEX "sales_saleDate_idx" ON "sales"("saleDate");

-- CreateIndex
CREATE INDEX "sales_saleChannel_idx" ON "sales"("saleChannel");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "sale_items_productId_idx" ON "sale_items"("productId");

-- CreateIndex
CREATE INDEX "sale_costs_saleId_idx" ON "sale_costs"("saleId");

-- CreateIndex
CREATE INDEX "sale_costs_costType_idx" ON "sale_costs"("costType");

-- CreateIndex
CREATE INDEX "sale_profit_snapshots_profit_idx" ON "sale_profit_snapshots"("profit");

-- CreateIndex
CREATE INDEX "sale_profit_snapshots_marginPercentage_idx" ON "sale_profit_snapshots"("marginPercentage");

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_costs" ADD CONSTRAINT "sale_costs_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_profit_snapshots" ADD CONSTRAINT "sale_profit_snapshots_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
