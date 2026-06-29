import { Test, TestingModule } from '@nestjs/testing';
import { ProfitCalculatorService } from './profit-calculator.service';
import { SaleItem } from '../../../sales/domain/entities/sale-item.entity';
import { SaleCost } from '../../../sales/domain/entities/sale-cost.entity';

describe('ProfitCalculatorService', () => {
  let service: ProfitCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitCalculatorService],
    }).compile();

    service = module.get<ProfitCalculatorService>(ProfitCalculatorService);
  });

  describe('calculateRevenue', () => {
    it('should sum unitPriceNet * quantity for all items', () => {
      const items = [
        new SaleItem('1', 'sale1', 'prod1', 2, 500, 420.17, 79.83, new Date()),
        new SaleItem('2', 'sale1', 'prod2', 1, 300, 252.1, 47.9, new Date()),
      ];

      const revenue = service.calculateRevenue(items);

      expect(revenue).toBe(420.17 * 2 + 252.1 * 1);
    });

    it('should return 0 for empty items', () => {
      expect(service.calculateRevenue([])).toBe(0);
    });
  });

  describe('calculateCosts', () => {
    it('should sum costNet for all costs', () => {
      const costs = [
        new SaleCost(
          '1',
          'sale1',
          'SUPPLIER',
          undefined,
          new Date(),
          200,
          168.07,
          31.93,
          new Date(),
          new Date(),
        ),
        new SaleCost(
          '2',
          'sale1',
          'TRANSPORT',
          undefined,
          new Date(),
          50,
          42.02,
          7.98,
          new Date(),
          new Date(),
        ),
      ];

      const totalCost = service.calculateCosts(costs);

      expect(totalCost).toBe(168.07 + 42.02);
    });

    it('should return 0 for empty costs', () => {
      expect(service.calculateCosts([])).toBe(0);
    });
  });

  describe('calculateProfit', () => {
    it('should return revenue minus costs', () => {
      expect(service.calculateProfit(1000, 600)).toBe(400);
    });
  });

  describe('calculateMargin', () => {
    it('should return (profit / revenue) * 100', () => {
      expect(service.calculateMargin(400, 1000)).toBe(40);
    });

    it('should return 0 when revenue is 0', () => {
      expect(service.calculateMargin(0, 0)).toBe(0);
    });
  });

  describe('calculate', () => {
    it('should compute full profitability', () => {
      const items = [
        new SaleItem('1', 'sale1', 'prod1', 2, 500, 420.17, 79.83, new Date()),
      ];
      const costs = [
        new SaleCost(
          '1',
          'sale1',
          'SUPPLIER',
          undefined,
          new Date(),
          200,
          168.07,
          31.93,
          new Date(),
          new Date(),
        ),
      ];

      const result = service.calculate(items, costs);

      expect(result.revenueNet).toBeCloseTo(840.34, 2);
      expect(result.totalCostNet).toBe(168.07);
      expect(result.profit).toBeCloseTo(672.27, 2);
      expect(result.marginPercentage).toBeCloseTo(80, 2);
    });

    it('should handle empty items and costs', () => {
      const result = service.calculate([], []);

      expect(result.revenueNet).toBe(0);
      expect(result.totalCostNet).toBe(0);
      expect(result.profit).toBe(0);
      expect(result.marginPercentage).toBe(0);
    });
  });
});
