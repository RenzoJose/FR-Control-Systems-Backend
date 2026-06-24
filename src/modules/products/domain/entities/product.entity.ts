export class Product {
  constructor(
    public readonly id: string,
    public sku: string,
    public name: string,
    public categoryId: string,
    public supplierId: string,
    public brand?: string,
    public deletedAt?: Date,
  ) {}
}
