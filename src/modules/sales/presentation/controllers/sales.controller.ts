import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSaleDto } from '../../application/dto/create-sale.dto';
import { UpdateSaleDto } from '../../application/dto/update-sale.dto';
import { CreateSaleUseCase } from '../../application/use-cases/create-sale.use-case';
import { GetSaleUseCase } from '../../application/use-cases/get-sale.use-case';
import { ListSalesUseCase } from '../../application/use-cases/list-sales.use-case';
import { UpdateSaleUseCase } from '../../application/use-cases/update-sale.use-case';

@ApiTags('Sales')
@Controller('api/v1/sales')
export class SalesController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly listSalesUseCase: ListSalesUseCase,
    private readonly getSaleUseCase: GetSaleUseCase,
    private readonly updateSaleUseCase: UpdateSaleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create sale' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Sale created' })
  async create(@Body() dto: CreateSaleDto) {
    const sale = await this.createSaleUseCase.execute(dto);

    return { data: { id: sale.id } };
  }

  @Get()
  @ApiOperation({ summary: 'List sales' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sales listed' })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('channel') channel?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.listSalesUseCase.execute({
      channel,
      dateFrom,
      dateTo,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sale found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sale not found' })
  async findById(@Param('id') id: string) {
    const sale = await this.getSaleUseCase.execute(id);

    return { data: sale };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sale' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sale updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sale not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateSaleDto) {
    const sale = await this.updateSaleUseCase.execute(id, dto);

    return { data: sale };
  }
}
