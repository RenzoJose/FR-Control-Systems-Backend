import { Test, TestingModule } from '@nestjs/testing';
import { CreateSaleUseCase } from './create-sale.use-case';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { CreateSaleDto } from '../dto/create-sale.dto';

describe('CreateSaleUseCase', () => {
  let useCase: CreateSaleUseCase;
  let saleRepository: jest.Mocked<SaleRepository>;

  beforeEach(async () => {
    saleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSaleUseCase,
        {
          provide: SALE_REPOSITORY,
          useValue: saleRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateSaleUseCase>(CreateSaleUseCase);
  });

  it('should create a sale with items and costs', async () => {
    const dto: CreateSaleDto = {
      saleChannel: 'FALABELLA',
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
          costType: 'SUPPLIER',
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
      saleChannel: 'FALABELLA',
      saleDate: new Date('2026-06-10'),
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      costs: [],
    });

    const result = await useCase.execute(dto);

    expect(result.id).toBe('new-sale-id');
    expect(saleRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        saleChannel: 'FALABELLA',
      }),
    );
  });

  it('should create a sale without costs', async () => {
    const dto: CreateSaleDto = {
      saleChannel: 'DIRECT',
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
      saleChannel: 'DIRECT',
      saleDate: new Date('2026-06-10'),
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      costs: [],
    });

    const result = await useCase.execute(dto);

    expect(result.id).toBe('new-sale-id');
    expect(saleRepository.create).toHaveBeenCalled();
  });
});
