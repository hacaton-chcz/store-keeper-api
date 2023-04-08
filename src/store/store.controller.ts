import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';
import { StoreInvoiceDto } from './dto/store-invoice.dto';
import { OnLoadDto } from './dto/on-load.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Get('invoices')
  async GetActiveInvoices(): Promise<StoreInvoiceDto[]> {
    return await this.storeService.findActiveInvoices();
  }

  @Put('invite/:invoiceId')
  async Invite(@Param('invoiceId') invoiceId: string): Promise<any> {
    await this.storeService.Invite(invoiceId);
  }

  @Put('load')
  async Load(@Body() onLoadDto: OnLoadDto): Promise<any> {
    console.log(onLoadDto);
    await this.storeService.Load(onLoadDto);
  }

  @Get('car-number-for-check')
  async GetCarNumberForCheckpoint(): Promise<string> {
    return await this.storeService.GetCarNumberForCheckpoint();
  }

  @Get('migrate')
  async MigrateData(): Promise<void> {
    return await this.storeService.AddData();
  }
}
