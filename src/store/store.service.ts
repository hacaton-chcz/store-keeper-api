import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from 'src/store/entities';
import { Repository } from 'typeorm';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(InvoiceEntity)
        private readonly invoiceRepository: Repository<InvoiceEntity>
    ) {}

    async findActiveInvoices(): Promise<any> {
        return this.invoiceRepository.find();
    }
}
