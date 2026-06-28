import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RecalculateProfitabilityUseCase } from './recalculate-profitability.use-case';
import { ProfitCalculatorService } from '../../domain/services/profit-calculator.service';
import { PROFITABILITY_REPOSITORY } from '../../domain/repositories/profitability.repository.token';
import type { ProfitabilityRepository } from '../../domain/repositories/profitability.repository';
import { SALE_REPOSITORY } from '../../../sales/domain/repositories/sale.repository.token';
import type { SaleRepository } from '../../../sales/domain/repositories/sale.repository';
import { Sale } from '../../../sales/domain/entities/sale.entity';
import { SaleItem } from '../../../sales/domain/entities/sale-item.entity';
import { SaleCost } from '../../../sales/domain/entities/sale-cost.entity';

describe('RecalculateProfitabilityUseCase', () => {
  let useCase: RecalculateProfitabilityUseCase;
  let profitabilityRepository: jest.Mocked<ProfitabilityRepository>;
  let saleRepository: jest.Mocked<SaleRepository>;

  beforeEach(async () => {
    profitabilityRepository = {
      findBySaleId: jest.fn(),
      upsert: jest.fn(),
    };

    saleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecalculateProfitabilityUseCase,
        ProfitCalculatorService,
        {
          provide: PROFITABILITY_REPOSITORY,
          useValue: profitabilityRepository,
        },
        {
          provide: SALE_REPOSITORY,
          useValue: saleRepository,
        },
      ],
    }).compile();

    useCase = module.get<RecalculateProfitabilityUseCase>(
      RecalculateProfitabilityUseCase,
    );
  });

  it('should calculate and persist profitability snapshot', async () => {
    const now = new Date();
    const items = [
      new SaleItem('item-1', 'sale-1', 'prod-1', 2, 500, 420.17, 79.83, now),
    ];
    const costs = [
      new SaleCost(
        'cost-1',
        'sale-1',
        'SUPPLIER',
        undefined,
        now,
        200,
        168.07,
        31.93,
        now,
        now,
      ),
    ];
    const sale = new Sale(
      'sale-1',
      'FALABELLA',
      now,
      now,
      now,
      undefined,
      items,
      costs,
    );

    saleRepository.findById.mockResolvedValue(sale);

    const expectedSnapshot = {
      saleId: 'sale-1',
      revenueNet: 840.34,
      totalCostNet: 168.07,
      profit: 672.27,
      marginPercentage: 80,
      createdAt: now,
    };

    profitabilityRepository.upsert.mockResolvedValue(expectedSnapshot);

    const result = await useCase.execute('sale-1');

    expect(result.saleId).toBe('sale-1');
    expect(result.revenueNet).toBeCloseTo(840.34, 2);
    expect(result.totalCostNet).toBe(168.07);
    expect(result.profit).toBeCloseTo(672.27, 2);
    expect(profitabilityRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        saleId: 'sale-1',
        revenueNet: expect.any(Number),
      }),
    );
  });

  it('should throw NotFoundException when sale does not exist', async () => {
    saleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
