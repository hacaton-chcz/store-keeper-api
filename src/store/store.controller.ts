import { Controller, Get } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';

@Controller('store')
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

    @Get('invoices')
    async GetActiveInvoices(): Promise<any> {
        return await this.storeService.findActiveInvoices();
    }
}
