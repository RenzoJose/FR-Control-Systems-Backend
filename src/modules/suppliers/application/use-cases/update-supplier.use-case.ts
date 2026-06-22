import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { Supplier } from '../../domain/entities/supplier.entity';
import type { SupplierRepository } from '../../infrastructure/repositories/supplier.repository';
import { SUPPLIER_REPOSITORY } from '../../domain/repositories/supplier.repository.token';

@Injectable()
export class UpdateSupplierUseCase {
    constructor(
        @Inject(SUPPLIER_REPOSITORY)
        private readonly supplierRepository: SupplierRepository,
    ) { }

    async execute(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
        const currentSupplier = await this.supplierRepository.findById(id);

        if (!currentSupplier) {
            throw new NotFoundException({
                code: 'SUPPLIER_NOT_FOUND',
                message: 'Supplier not found',
            });
        }

        const supplier = new Supplier(
            currentSupplier.id,
            dto.name ?? currentSupplier.name,
            dto.contactName ?? currentSupplier.contactName,
            dto.phone ?? currentSupplier.phone,
            dto.email ?? currentSupplier.email,
            dto.notes ?? currentSupplier.notes,
            currentSupplier.deletedAt,
        );

        return this.supplierRepository.update(supplier);
    }
}