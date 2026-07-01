import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateSaleItemDto {
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

  @ApiPropertyOptional({ example: 210084.03 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPriceNet?: number;

  @ApiPropertyOptional({ example: 39915.97 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  vatAmount?: number;

  @ApiPropertyOptional({ example: 19 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  vatRate?: number;
}
