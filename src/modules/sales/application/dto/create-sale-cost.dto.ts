import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CostType } from '../../../../shared/enums/cost-type.enum';

export class CreateSaleCostDto {
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

  @ApiProperty({ example: 126050.42 })
  @IsNumber()
  @Min(0)
  costNet!: number;

  @ApiProperty({ example: 23949.58 })
  @IsNumber()
  @Min(0)
  vatAmount!: number;
}
