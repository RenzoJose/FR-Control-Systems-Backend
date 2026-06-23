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

import { CreateSupplierDto } from '../../application/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../../application/dto/update-supplier.dto';
import { CreateSupplierUseCase } from '../../application/use-cases/create-supplier.use-case';
import { DeactivateSupplierUseCase } from '../../application/use-cases/deactivate-supplier.use-case';
import { GetSupplierUseCase } from '../../application/use-cases/get-supplier.use-case';
import { ListSuppliersUseCase } from '../../application/use-cases/list-suppliers.use-case';
import { UpdateSupplierUseCase } from '../../application/use-cases/update-supplier.use-case';

@ApiTags('Suppliers')
@Controller('api/v1/suppliers')
export class SuppliersController {
    constructor(
        private readonly createSupplierUseCase: CreateSupplierUseCase,
        private readonly listSuppliersUseCase: ListSuppliersUseCase,
        private readonly getSupplierUseCase: GetSupplierUseCase,
        private readonly updateSupplierUseCase: UpdateSupplierUseCase,
        private readonly deactivateSupplierUseCase: DeactivateSupplierUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create supplier' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Supplier created' })
    async create(@Body() dto: CreateSupplierDto) {
        const supplier = await this.createSupplierUseCase.execute(dto);

        return { data: { id: supplier.id } };
    }

    @Get()
    @ApiOperation({ summary: 'List suppliers' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Suppliers listed' })
    async findAll() {
        const suppliers = await this.listSuppliersUseCase.execute();

        return { data: suppliers };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get supplier' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Supplier found' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Supplier not found' })
    async findById(@Param('id') id: string) {
        const supplier = await this.getSupplierUseCase.execute(id);

        return { data: supplier };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update supplier' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Supplier updated' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Supplier not found' })
    async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
        const supplier = await this.updateSupplierUseCase.execute(id, dto);

        return { data: supplier };
    }
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate supplier' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Supplier deactivated' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Supplier not found' })
    async deactivate(@Param('id') id: string) {
        await this.deactivateSupplierUseCase.execute(id);
    }
}   