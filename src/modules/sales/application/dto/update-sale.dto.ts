import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SaleChannel } from '../../../../shared/enums/sale-channel.enum';
import { UpdateSaleItemDto } from './update-sale-item.dto';
import { UpdateSaleCostDto } from './update-sale-cost.dto';

export class UpdateSaleDto {
  @ApiPropertyOptional({ enum: SaleChannel, example: 'FALABELLA' })
  @IsEnum(SaleChannel)
  @IsOptional()
  saleChannel?: SaleChannel;

  @ApiPropertyOptional({ example: '2026-06-10' })
  @IsDateString()
  @IsOptional()
  saleDate?: string;

  @ApiPropertyOptional({ type: [UpdateSaleItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSaleItemDto)
  items?: UpdateSaleItemDto[];

  @ApiPropertyOptional({ type: [UpdateSaleCostDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSaleCostDto)
  costs?: UpdateSaleCostDto[];
}
