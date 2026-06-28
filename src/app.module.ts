import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { ProfitabilityModule } from './modules/profitability/profitability.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SaleCostsModule } from './modules/sale-costs/sale-costs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    CategoriesModule,
    SuppliersModule,
    ProductsModule,
    SalesModule,
    ProfitabilityModule,
    DashboardModule,
    SaleCostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
