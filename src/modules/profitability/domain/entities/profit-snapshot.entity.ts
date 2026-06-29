export class ProfitSnapshot {
  constructor(
    public readonly saleId: string,
    public revenueNet: number,
    public totalCostNet: number,
    public profit: number,
    public marginPercentage: number,
    public readonly createdAt: Date,
  ) {}
}
