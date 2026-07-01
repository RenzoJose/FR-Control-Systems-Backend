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
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateProductDto } from '../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { DeactivateProductUseCase } from '../../application/use-cases/deactivate-product.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';

@ApiTags('Products')
@Controller('api/v1/products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deactivateProductUseCase: DeactivateProductUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created' })
  async create(@Body() dto: CreateProductDto) {
    const product = await this.createProductUseCase.execute(dto);

    return { data: { id: product.id } };
  }

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Products listed' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.listProductsUseCase.execute({
      categoryId,
      supplierId,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async findById(@Param('id') id: string) {
    const product = await this.getProductUseCase.execute(id);

    return { data: product };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product updated' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.updateProductUseCase.execute(id, dto);

    return { data: product };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate product' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product deactivated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async deactivate(@Param('id') id: string) {
    await this.deactivateProductUseCase.execute(id);
  }
}
