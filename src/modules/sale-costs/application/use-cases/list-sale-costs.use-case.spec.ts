import { Test, TestingModule } from '@nestjs/testing';
import { ListSaleCostsUseCase } from './list-sale-costs.use-case';
import { SALE_COST_REPOSITORY } from '../../domain/repositories/sale-cost.repository.token';
import type { SaleCostRepository } from '../../domain/repositories/sale-cost.repository';

describe('ListSaleCostsUseCase', () => {
  let useCase: ListSaleCostsUseCase;
  let saleCostRepository: jest.Mocked<SaleCostRepository>;

  beforeEach(async () => {
    saleCostRepository = {
      create: jest.fn(),
      findAllBySaleId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListSaleCostsUseCase,
        {
          provide: SALE_COST_REPOSITORY,
          useValue: saleCostRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListSaleCostsUseCase>(ListSaleCostsUseCase);
  });

  it('should list all costs for a sale', async () => {
    saleCostRepository.findAllBySaleId.mockResolvedValue([
      { id: 'cost-1' },
      { id: 'cost-2' },
    ] as never);

    const result = await useCase.execute('sale-1');

    expect(result).toHaveLength(2);
    expect(saleCostRepository.findAllBySaleId).toHaveBeenCalledWith('sale-1');
  });
});
