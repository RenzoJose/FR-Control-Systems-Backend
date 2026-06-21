import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Camas' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'camas' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Productos para descanso' })
  @IsString()
  @IsOptional()
  description?: string;
}
