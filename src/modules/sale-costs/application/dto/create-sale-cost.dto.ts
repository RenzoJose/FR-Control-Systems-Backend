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
  @ApiProperty({ enum: CostType, example: 'TRANSPORT' })
  @IsEnum(CostType)
  costType!: CostType;

  @ApiPropertyOptional({ example: 'Flete a Santiago' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-06-28' })
  @IsDateString()
  occurredAt!: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  costGross!: number;

  @ApiProperty({ example: 42016.81 })
  @IsNumber()
  @Min(0)
  costNet!: number;

  @ApiProperty({ example: 7983.19 })
  @IsNumber()
  @Min(0)
  vatAmount!: number;
}
