import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateSaleCostUseCase } from './create-sale-cost.use-case';
import { SALE_COST_REPOSITORY } from '../../domain/repositories/sale-cost.repository.token';
import type { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';
import { SALE_REPOSITORY } from '../../../sales/domain/repositories/sale.repository.token';
import type { SaleRepository } from '../../../sales/domain/repositories/sale.repository';
import { RecalculateProfitabilityUseCase } from '../../../profitability/application/use-cases/recalculate-profitability.use-case';
import { CreateSaleCostDto } from '../dto/create-sale-cost.dto';
import { CostType } from '../../../../shared/enums/cost-type.enum';

describe('CreateSaleCostUseCase', () => {
  let useCase: CreateSaleCostUseCase;
  let saleCostRepository: jest.Mocked<SaleCostRepository>;
  let saleRepository: jest.Mocked<SaleRepository>;
  let recalculate: jest.Mocked<RecalculateProfitabilityUseCase>;

  beforeEach(async () => {
    saleCostRepository = {
      create: jest.fn(),
      findAllBySaleId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };

    saleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    recalculate = { execute: jest.fn() } as never;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSaleCostUseCase,
        {
          provide: SALE_COST_REPOSITORY,
          useValue: saleCostRepository,
        },
        {
          provide: SALE_REPOSITORY,
          useValue: saleRepository,
        },
        {
          provide: RecalculateProfitabilityUseCase,
          useValue: recalculate,
        },
      ],
    }).compile();

    useCase = module.get<CreateSaleCostUseCase>(CreateSaleCostUseCase);
  });

  it('should add cost and recalculate profitability', async () => {
    saleRepository.findById.mockResolvedValue({ id: 'sale-1' } as never);

    saleCostRepository.create.mockResolvedValue({
      id: 'cost-1',
      saleId: 'sale-1',
      costType: 'TRANSPORT',
    } as never);

    const dto: CreateSaleCostDto = {
      costType: CostType.TRANSPORT,
      occurredAt: '2026-06-28',
      costGross: 50000,
      costNet: 42016.81,
      vatAmount: 7983.19,
    };

    const result = await useCase.execute('sale-1', dto);

    expect(result.id).toBe('cost-1');
    expect(saleCostRepository.create).toHaveBeenCalled();
    expect(recalculate.execute).toHaveBeenCalledWith('sale-1');
  });

  it('should throw NotFoundException when sale does not exist', async () => {
    saleRepository.findById.mockResolvedValue(null);

    const dto: CreateSaleCostDto = {
      costType: CostType.TRANSPORT,
      occurredAt: '2026-06-28',
      costGross: 50000,
      costNet: 42016.81,
      vatAmount: 7983.19,
    };

    await expect(useCase.execute('nonexistent', dto)).rejects.toThrow(
      NotFoundException,
    );
  });
});
