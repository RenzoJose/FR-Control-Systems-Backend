import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateSaleItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  unitPriceGross!: number;

  @ApiProperty({ example: 210084.03 })
  @IsNumber()
  @Min(0)
  unitPriceNet!: number;

  @ApiProperty({ example: 39915.97 })
  @IsNumber()
  @Min(0)
  vatAmount!: number;
}
