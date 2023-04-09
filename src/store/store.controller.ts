import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';
import { StoreInvoiceDto } from './dto/store-invoice.dto';
import { OnLoadDto } from './dto/on-load.dto';
import { CarForLoadDto } from './dto/car-for-load.dto';

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
    await this.storeService.SetLoadStatus(onLoadDto);
  }

  @Get('car-number-for-check')
  async GetCarNumberForCheckpoint(): Promise<string> {
    console.log('asdsad')
    return await this.storeService.GetCarNumberForCheckpoint();
  }

  @Get('car-number-for-load')
  async GetCarNumberForLoad(): Promise<CarForLoadDto> {
    return await this.storeService.GetCarNumberForLoad();
  }

  @Put('cancel-load/:invoiceId')
  async CancelLoad(@Param('invoiceId') invoiceId: string): Promise<any> {
    await this.storeService.SetCancelLoadStatus(invoiceId);
  }

  @Put('arrived/:invoiceId')
  async SetArrivedStatus(@Param('invoiceId') invoiceId: string): Promise<any> {
    await this.storeService.SetArrivedStatus(invoiceId);
  }

  @Put('check-passed/:invoiceId')
  async SetCheckPassStatus(@Param('invoiceId') invoiceId: string): Promise<any> {
    await this.storeService.SetCheckPassStatus(invoiceId);
  }

  @Get('migrate')
  async MigrateData(): Promise<void> {
    return await this.storeService.AddData();
  }
}
