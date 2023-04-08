import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity, ProductEntity } from 'src/store/entities';
import { Equal, Repository } from 'typeorm';
import * as fs from 'fs';
import { StatusesEnum } from './entities/invoice.entity';
import { ProductDto, StoreInvoiceDto } from './dto/store-invoice.dto';
import * as moment from 'moment';
import { UnitsEnum } from './entities/product.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>
  ) { }

  async findActiveInvoices(): Promise<StoreInvoiceDto[]> {
    await this.updateCheckInfo();

    const arraivedInvoices = await this.invoiceRepository.find({
      relations: ['Product']
    });


    return arraivedInvoices.filter((x) => x.Status != StatusesEnum.CREATED).map((invoice) => {
      const storeInvoiceDto = new StoreInvoiceDto();
      storeInvoiceDto.invoiceId = invoice.InvoiceId;
      storeInvoiceDto.carNumber = invoice.CarNumber;
      storeInvoiceDto.status = invoice.Status;

      storeInvoiceDto.from = moment(invoice.From).format('DD.MM.YYYY');
      storeInvoiceDto.to = moment(invoice.To).format('DD.MM.YYYY');

      storeInvoiceDto.product = new ProductDto();
      storeInvoiceDto.product.name = invoice.Product.Name;
      storeInvoiceDto.product.amount = invoice.ProductAmount;
      storeInvoiceDto.product.units = UnitsEnum[invoice.Product.Units].toString();

      return storeInvoiceDto;
    })
  }

  async updateCheckInfo(): Promise<void> {
    const invitedInvoices = await this.invoiceRepository.find({
      where: {
        Status: Equal(
          StatusesEnum.INVITED,
        ),
      },
    });

    invitedInvoices
      .filter((x) => x.MustBeOnCheckUtc && moment(x.MustBeOnCheckUtc).add(30, 'minutes') < moment())
      .forEach((x) => {
        x.Status = StatusesEnum.ARRIVED;
        x.MustBeOnCheckUtc = null;
        this.invoiceRepository.save(x);
      });
  }

  async AddData(): Promise<void> {
    fs.readFile('./assets/data.json', 'utf8', (error, data) => {
      if (error) {
        console.log(`ERROR: ${error}`)
        return
      }

      const jsonData = JSON.parse(data);

      jsonData.data.forEach((rawData: any) => {
        const invoice = new InvoiceEntity();

        invoice.InvoiceId = rawData['Номер пропуска'];
        invoice.CarNumber = rawData['Номер авто'];
        invoice.DriverFullName = rawData['ФИО Водителя'];
        invoice.ProductAmount = parseFloat(rawData['Объем продукции'].replace(',', '.')) as number;

        const productName = rawData['Вид продукции'] as string;

        invoice.From = moment().toDate();
        invoice.To = moment().add(3, 'days').toDate();

        invoice.Status = StatusesEnum.ARRIVED;
        invoice.StatusUpdatedUtc = new Date();

        this.productRepository
          .findOne({
            where: {
              Name: Equal(
                productName,
              ),
            }
          }).then((product) => {
            invoice.Product = product;

            this.invoiceRepository.save(invoice);
          })
      });
    })
  }

  async Invite(invoiceId: string): Promise<void> {
    const invitedInvoices = await this.invoiceRepository.findOneBy({
      InvoiceId: Equal(
        invoiceId,
      ),
    });

    if (!invitedInvoices) {
      return;
    }

    invitedInvoices.Status = StatusesEnum.INVITED;
    invitedInvoices.MustBeOnCheckUtc = moment(new Date())
      .add(30, 'minutes')
      .toDate()

    this.invoiceRepository.save(invitedInvoices);
  }
}
