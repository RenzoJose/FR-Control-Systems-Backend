import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetSaleUseCase } from './get-sale.use-case';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository.token';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import { Sale } from '../../domain/entities/sale.entity';

describe('GetSaleUseCase', () => {
  let useCase: GetSaleUseCase;
  let saleRepository: jest.Mocked<SaleRepository>;

  beforeEach(async () => {
    saleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSaleUseCase,
        {
          provide: SALE_REPOSITORY,
          useValue: saleRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetSaleUseCase>(GetSaleUseCase);
  });

  it('should return a sale when found', async () => {
    const sale = new Sale(
      'sale-1',
      'FALABELLA',
      new Date(),
      new Date(),
      new Date(),
    );

    saleRepository.findById.mockResolvedValue(sale);

    const result = await useCase.execute('sale-1');

    expect(result).toBe(sale);
  });

  it('should throw NotFoundException when sale not found', async () => {
    saleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
