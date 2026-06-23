import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Proveedor XYZ' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({ example: '+56911111111' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'ventas@proveedor.cl' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Fabricante directo' })
  @IsString()
  @IsOptional()
  notes?: string;
}
