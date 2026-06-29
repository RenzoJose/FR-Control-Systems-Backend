import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CostType } from '../../../../shared/enums/cost-type.enum';

export class UpdateSaleCostDto {
  @ApiPropertyOptional({ enum: CostType, example: 'TRANSPORT' })
  @IsEnum(CostType)
  @IsOptional()
  costType?: CostType;

  @ApiPropertyOptional({ example: 'Flete a Santiago' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-06-28' })
  @IsDateString()
  @IsOptional()
  occurredAt?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  costGross?: number;

  @ApiPropertyOptional({ example: 42016.81 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  costNet?: number;

  @ApiPropertyOptional({ example: 7983.19 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  vatAmount?: number;
}
