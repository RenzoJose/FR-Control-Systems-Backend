import { Module, forwardRef } from '@nestjs/common';
import { CreateSaleUseCase } from './application/use-cases/create-sale.use-case';
import { GetSaleUseCase } from './application/use-cases/get-sale.use-case';
import { ListSalesUseCase } from './application/use-cases/list-sales.use-case';
import { UpdateSaleUseCase } from './application/use-cases/update-sale.use-case';
import { SALE_REPOSITORY } from './domain/repositories/sale.repository.token';
import { PrismaSaleRepository } from './infrastructure/repositories/prisma-sale.repository';
import { SalesController } from './presentation/controllers/sales.controller';
import { ProfitabilityModule } from '../profitability/profitability.module';

@Module({
  imports: [forwardRef(() => ProfitabilityModule)],
  controllers: [SalesController],
  providers: [
    {
      provide: SALE_REPOSITORY,
      useClass: PrismaSaleRepository,
    },
    CreateSaleUseCase,
    GetSaleUseCase,
    ListSalesUseCase,
    UpdateSaleUseCase,
  ],
  exports: [SALE_REPOSITORY],
})
export class SalesModule {}
