import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { Supplier } from '../../domain/entities/supplier.entity';
import type { SupplierRepository } from '../../infrastructure/repositories/supplier.repository';
import { SUPPLIER_REPOSITORY } from '../../domain/repositories/supplier.repository.token';

@Injectable()
export class CreateSupplierUseCase {
    constructor(
        @Inject(SUPPLIER_REPOSITORY)
        private readonly supplierRepository: SupplierRepository,
    ) { }

    async execute(dto: CreateSupplierDto): Promise<Supplier> {
        const supplier = new Supplier(
            randomUUID(),
            dto.name,
            dto.contactName,
            dto.phone,
            dto.email,
            dto.notes,
        );

        return this.supplierRepository.create(supplier);
    }
}          