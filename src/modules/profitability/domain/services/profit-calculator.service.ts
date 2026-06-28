import { Injectable } from '@nestjs/common';
import { SaleItem } from '../../../sales/domain/entities/sale-item.entity';
import { SaleCost } from '../../../sales/domain/entities/sale-cost.entity';

export interface ProfitCalculation {
  revenueNet: number;
  totalCostNet: number;
  profit: number;
  marginPercentage: number;
}

@Injectable()
export class ProfitCalculatorService {
  calculateRevenue(items: SaleItem[]): number {
    return items.reduce(
      (sum, item) => sum + item.unitPriceNet * item.quantity,
      0,
    );
  }

  calculateCosts(costs: SaleCost[]): number {
    return costs.reduce((sum, cost) => sum + cost.costNet, 0);
  }

  calculateProfit(revenueNet: number, totalCostNet: number): number {
    return revenueNet - totalCostNet;
  }

  calculateMargin(profit: number, revenueNet: number): number {
    if (revenueNet === 0) {
      return 0;
    }

    return (profit / revenueNet) * 100;
  }

  calculate(items: SaleItem[], costs: SaleCost[]): ProfitCalculation {
    const revenueNet = this.calculateRevenue(items);
    const totalCostNet = this.calculateCosts(costs);
    const profit = this.calculateProfit(revenueNet, totalCostNet);
    const marginPercentage = this.calculateMargin(profit, revenueNet);

    return {
      revenueNet,
      totalCostNet,
      profit,
      marginPercentage,
    };
  }
}
