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

  it('should list all costs for a sale with pagination', async () => {
    saleCostRepository.findAllBySaleId.mockResolvedValue({
      data: [{ id: 'cost-1' }, { id: 'cost-2' }] as never,
      total: 2,
    });

    const result = await useCase.execute('sale-1');

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(saleCostRepository.findAllBySaleId).toHaveBeenCalledWith('sale-1', { skip: 0, take: 10 });
  });
});
