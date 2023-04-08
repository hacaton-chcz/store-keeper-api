import { Controller, Get } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';
import { StoreInvoiceDto } from './dto/store-invoice.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Get('invoices')
  async GetActiveInvoices(): Promise<StoreInvoiceDto[]> {
    return await this.storeService.findActiveInvoices();
  }

  @Get('migrate')
  async MigrateData(): Promise<void> {
    return await this.storeService.AddData();
  }
}
