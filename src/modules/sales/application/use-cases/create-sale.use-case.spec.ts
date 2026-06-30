import { Test, TestingModule } from '@nestjs/testing';
import { CreateSaleUseCase } from './create-sale.use-case';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { PROFITABILITY_REPOSITORY } from '../../../profitability/domain/repositories/profitability.repository.token';
import type { ProfitabilityRepository } from '../../../profitability/domain/repositories/profitability.repository';
import { ProfitCalculatorService } from '../../../profitability/domain/services/profit-calculator.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { SaleChannel } from '../../../../shared/enums/sale-channel.enum';
import { CostType } from '../../../../shared/enums/cost-type.enum';

describe('CreateSaleUseCase', () => {
  let useCase: CreateSaleUseCase;
  let saleRepository: jest.Mocked<SaleRepository>;
  let profitabilityRepository: jest.Mocked<ProfitabilityRepository>;

  beforeEach(async () => {
    saleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    profitabilityRepository = {
      findBySaleId: jest.fn(),
      upsert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSaleUseCase,
        ProfitCalculatorService,
        {
          provide: SALE_REPOSITORY,
          useValue: saleRepository,
        },
        {
          provide: PROFITABILITY_REPOSITORY,
          useValue: profitabilityRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateSaleUseCase>(CreateSaleUseCase);
  });

  it('should create a sale and auto-generate profitability snapshot', async () => {
    const dto: CreateSaleDto = {
      saleChannel: SaleChannel.FALABELLA,
      saleDate: '2026-06-10',
      items: [
        {
          productId: 'prod-1',
          quantity: 2,
          unitPriceGross: 500,
          unitPriceNet: 420.17,
          vatAmount: 79.83,
        },
      ],
      costs: [
        {
          costType: CostType.SUPPLIER,
          description: 'Compra fabricante',
          occurredAt: '2026-06-10',
          costGross: 200,
          costNet: 168.07,
          vatAmount: 31.93,
        },
      ],
    };

    saleRepository.create.mockResolvedValue({
      id: 'new-sale-id',
      saleChannel: SaleChannel.FALABELLA,
      saleDate: new Date('2026-06-10'),
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      costs: [],
    });

    profitabilityRepository.upsert.mockResolvedValue({} as never);

    const result = await useCase.execute(dto);

    expect(result.id).toBe('new-sale-id');
    expect(saleRepository.create).toHaveBeenCalled();
    expect(profitabilityRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        saleId: expect.any(String),
        revenueNet: expect.any(Number),
      }),
    );
  });

  it('should create a sale without costs and generate snapshot', async () => {
    const dto: CreateSaleDto = {
      saleChannel: SaleChannel.DIRECT,
      saleDate: '2026-06-10',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          unitPriceGross: 1000,
          unitPriceNet: 840.34,
          vatAmount: 159.66,
        },
      ],
    };

    saleRepository.create.mockResolvedValue({
      id: 'new-sale-id',
      saleChannel: SaleChannel.DIRECT,
      saleDate: new Date('2026-06-10'),
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      costs: [],
    });

    profitabilityRepository.upsert.mockResolvedValue({} as never);

    const result = await useCase.execute(dto);

    expect(result.id).toBe('new-sale-id');
    expect(profitabilityRepository.upsert).toHaveBeenCalled();
  });
});
