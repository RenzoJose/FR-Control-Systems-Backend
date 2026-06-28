import { Module } from '@nestjs/common';
import { CreateSaleCostUseCase } from './application/use-cases/create-sale-cost.use-case';
import { UpdateSaleCostUseCase } from './application/use-cases/update-sale-cost.use-case';
import { DeactivateSaleCostUseCase } from './application/use-cases/deactivate-sale-cost.use-case';
import { ListSaleCostsUseCase } from './application/use-cases/list-sale-costs.use-case';
import { SALE_COST_REPOSITORY } from './domain/repositories/sale-cost.repository.token';
import { PrismaSaleCostRepository } from './infrastructure/repositories/prisma-sale-cost.repository';
import { SaleCostsController } from './presentation/controllers/sale-costs.controller';
import { ProfitabilityModule } from '../profitability/profitability.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [ProfitabilityModule, SalesModule],
  controllers: [SaleCostsController],
  providers: [
    {
      provide: SALE_COST_REPOSITORY,
      useClass: PrismaSaleCostRepository,
    },
    CreateSaleCostUseCase,
    UpdateSaleCostUseCase,
    DeactivateSaleCostUseCase,
    ListSaleCostsUseCase,
  ],
})
export class SaleCostsModule {}
