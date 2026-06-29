import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSaleCostDto } from '../../application/dto/create-sale-cost.dto';
import { UpdateSaleCostDto } from '../../application/dto/update-sale-cost.dto';
import { CreateSaleCostUseCase } from '../../application/use-cases/create-sale-cost.use-case';
import { UpdateSaleCostUseCase } from '../../application/use-cases/update-sale-cost.use-case';
import { DeactivateSaleCostUseCase } from '../../application/use-cases/deactivate-sale-cost.use-case';
import { ListSaleCostsUseCase } from '../../application/use-cases/list-sale-costs.use-case';

@ApiTags('Sale Costs')
@Controller('api/v1/sales/:saleId/costs')
export class SaleCostsController {
  constructor(
    private readonly createSaleCostUseCase: CreateSaleCostUseCase,
    private readonly updateSaleCostUseCase: UpdateSaleCostUseCase,
    private readonly deactivateSaleCostUseCase: DeactivateSaleCostUseCase,
    private readonly listSaleCostsUseCase: ListSaleCostsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add cost to sale' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cost added' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sale not found' })
  async create(
    @Param('saleId') saleId: string,
    @Body() dto: CreateSaleCostDto,
  ) {
    const cost = await this.createSaleCostUseCase.execute(saleId, dto);

    return { data: { id: cost.id } };
  }

  @Get()
  @ApiOperation({ summary: 'List costs for a sale' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Costs listed' })
  async findAll(@Param('saleId') saleId: string) {
    const costs = await this.listSaleCostsUseCase.execute(saleId);

    return { data: costs };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sale cost' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cost updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cost not found' })
  async update(
    @Param('saleId') saleId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSaleCostDto,
  ) {
    const cost = await this.updateSaleCostUseCase.execute(saleId, id, dto);

    return { data: cost };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a sale cost' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Cost removed' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cost not found' })
  async deactivate(@Param('saleId') saleId: string, @Param('id') id: string) {
    await this.deactivateSaleCostUseCase.execute(saleId, id);
  }
}
