import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../../domain/services/dashboard.service';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Summary retrieved' })
  async getSummary() {
    const summary = await this.dashboardService.getSummary();

    return { data: summary };
  }

  @Get('profit-trend')
  @ApiOperation({ summary: 'Get profit trend' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trend retrieved' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getProfitTrend(@Query('from') from?: string, @Query('to') to?: string) {
    const trend = await this.dashboardService.getProfitTrend(from, to);

    return { data: trend };
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top products by profit' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Top products retrieved' })
  async getTopProducts() {
    const items = await this.dashboardService.getTopProducts();

    return { data: items };
  }

  @Get('top-suppliers')
  @ApiOperation({ summary: 'Get top suppliers by profit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Top suppliers retrieved',
  })
  async getTopSuppliers() {
    const items = await this.dashboardService.getTopSuppliers();

    return { data: items };
  }

  @Get('top-categories')
  @ApiOperation({ summary: 'Get top categories by profit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Top categories retrieved',
  })
  async getTopCategories() {
    const items = await this.dashboardService.getTopCategories();

    return { data: items };
  }

  @Get('top-channels')
  @ApiOperation({ summary: 'Get top channels by profit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Top channels retrieved',
  })
  async getTopChannels() {
    const items = await this.dashboardService.getTopChannels();

    return { data: items };
  }
}
