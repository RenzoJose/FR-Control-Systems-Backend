import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CostType } from '../../../../shared/enums/cost-type.enum';

export class UpdateSaleCostDto {
  @ApiProperty({ enum: CostType, example: 'SUPPLIER' })
  @IsEnum(CostType)
  costType!: CostType;

  @ApiPropertyOptional({ example: 'Compra fabricante' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-06-10' })
  @IsDateString()
  occurredAt!: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  costGross!: number;

  @ApiPropertyOptional({ example: 126050.42 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  costNet?: number;

  @ApiPropertyOptional({ example: 23949.58 })
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
