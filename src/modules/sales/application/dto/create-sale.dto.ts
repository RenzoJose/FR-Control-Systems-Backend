import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SaleChannel } from '../../../../shared/enums/sale-channel.enum';
import { CreateSaleItemDto } from './create-sale-item.dto';
import { SaleCostEntryDto } from './sale-cost-entry.dto';

export class CreateSaleDto {
  @ApiProperty({ enum: SaleChannel, example: 'FALABELLA' })
  @IsEnum(SaleChannel)
  saleChannel!: SaleChannel;

  @ApiProperty({ example: '2026-06-10' })
  @IsDateString()
  saleDate!: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];

  @ApiPropertyOptional({ type: [SaleCostEntryDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SaleCostEntryDto)
  costs?: SaleCostEntryDto[];
}
