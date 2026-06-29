import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProfitabilityRepository } from '../../domain/repositories/profitability.repository';
import { PROFITABILITY_REPOSITORY } from '../../domain/repositories/profitability.repository.token';
import { ProfitSnapshot } from '../../domain/entities/profit-snapshot.entity';

@Injectable()
export class GetSaleProfitabilityUseCase {
  constructor(
    @Inject(PROFITABILITY_REPOSITORY)
    private readonly profitabilityRepository: ProfitabilityRepository,
  ) {}

  async execute(saleId: string): Promise<ProfitSnapshot> {
    const snapshot = await this.profitabilityRepository.findBySaleId(saleId);

    if (!snapshot) {
      throw new NotFoundException({
        code: 'PROFITABILITY_NOT_FOUND',
        message: 'Profitability not found for this sale',
      });
    }

    return snapshot;
  }
}
