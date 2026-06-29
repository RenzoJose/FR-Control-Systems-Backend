import { Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetSaleProfitabilityUseCase } from '../../application/use-cases/get-sale-profitability.use-case';
import { RecalculateProfitabilityUseCase } from '../../application/use-cases/recalculate-profitability.use-case';

@ApiTags('Profitability')
@Controller('api/v1/profitability')
export class ProfitabilityController {
  constructor(
    private readonly getSaleProfitabilityUseCase: GetSaleProfitabilityUseCase,
    private readonly recalculateProfitabilityUseCase: RecalculateProfitabilityUseCase,
  ) {}

  @Get('sales/:saleId')
  @ApiOperation({ summary: 'Get sale profitability' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profitability found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profitability not found',
  })
  async findBySaleId(@Param('saleId') saleId: string) {
    const snapshot = await this.getSaleProfitabilityUseCase.execute(saleId);

    return { data: snapshot };
  }

  @Post('sales/:saleId/recalculate')
  @ApiOperation({ summary: 'Recalculate profitability snapshot' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Snapshot recalculated' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sale not found',
  })
  async recalculate(@Param('saleId') saleId: string) {
    const snapshot = await this.recalculateProfitabilityUseCase.execute(saleId);

    return { data: snapshot };
  }
}
