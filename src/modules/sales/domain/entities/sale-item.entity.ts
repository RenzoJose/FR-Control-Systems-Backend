export class SaleItem {
  constructor(
    public readonly id: string,
    public saleId: string,
    public productId: string,
    public quantity: number,
    public unitPriceGross: number,
    public unitPriceNet: number,
    public vatAmount: number,
    public readonly createdAt: Date,
  ) {}
}
