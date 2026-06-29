import { Module, forwardRef } from '@nestjs/common';
import { ProfitCalculatorService } from './domain/services/profit-calculator.service';
import { GetSaleProfitabilityUseCase } from './application/use-cases/get-sale-profitability.use-case';
import { RecalculateProfitabilityUseCase } from './application/use-cases/recalculate-profitability.use-case';
import { PROFITABILITY_REPOSITORY } from './domain/repositories/profitability.repository.token';
import { PrismaProfitabilityRepository } from './infrastructure/repositories/prisma-profitability.repository';
import { ProfitabilityController } from './presentation/controllers/profitability.controller';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [forwardRef(() => SalesModule)],
  controllers: [ProfitabilityController],
  providers: [
    ProfitCalculatorService,
    {
      provide: PROFITABILITY_REPOSITORY,
      useClass: PrismaProfitabilityRepository,
    },
    GetSaleProfitabilityUseCase,
    RecalculateProfitabilityUseCase,
  ],
  exports: [ProfitCalculatorService, PROFITABILITY_REPOSITORY, RecalculateProfitabilityUseCase],
})
export class ProfitabilityModule {}
