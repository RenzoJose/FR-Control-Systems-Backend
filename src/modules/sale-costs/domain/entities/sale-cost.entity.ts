export class SaleCost {
  constructor(
    public readonly id: string,
    public saleId: string,
    public costType: string,
    public description: string | undefined,
    public occurredAt: Date,
    public costGross: number,
    public costNet: number,
    public vatAmount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public deletedAt?: Date,
  ) {}
}
