import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity, ProductEntity } from 'src/store/entities';
import { Equal, Repository } from 'typeorm';
import * as fs from 'fs';
import { StatusesEnum } from './entities/invoice.entity';
import { ProductDto, StoreInvoiceDto } from './dto/store-invoice.dto';
import * as moment from 'moment';
import { UnitsEnum } from './entities/product.entity';
import { OnLoadDto } from './dto/on-load.dto';
import { CarForLoadDto } from './dto/car-for-load.dto';

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
        x.StatusUpdatedUtc = moment(new Date()).toDate();
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
      .toDate();
    invitedInvoices.StatusUpdatedUtc = moment(new Date()).toDate();

    this.invoiceRepository.save(invitedInvoices);
  }

  async SetLoadStatus(onLoadDto: OnLoadDto): Promise<void> {
    const onLoadInvoice = await this.invoiceRepository.findOneBy({
      InvoiceId: Equal(
        onLoadDto.invoiceId,
      ),
      Status: Equal(
        StatusesEnum.PASSED_INSPECTION
      )
    });

    if (!onLoadInvoice) {
      return;
    }

    onLoadInvoice.Status = StatusesEnum.ON_LOAD;
    onLoadInvoice.StatusUpdatedUtc = moment(new Date()).toDate();
    onLoadInvoice.Entrance = onLoadDto.entrance;

    this.invoiceRepository.save(onLoadInvoice);
  }

  async GetCarNumberForCheckpoint(): Promise<string> {
    const onCheckPointInvoice = (await this.invoiceRepository.find({
      where: {
        Status: Equal(
          StatusesEnum.INVITED
        )
      },
      order: {
        MustBeOnCheckUtc: "ASC"
      }
    }))[0];

    if (!onCheckPointInvoice) {
      return;
    }

    return onCheckPointInvoice.CarNumber;
  }

  async GetCarNumberForLoad(): Promise<CarForLoadDto> {
    const onLoadInvoice = (await this.invoiceRepository.find({
      where: {
        Status: Equal(
          StatusesEnum.PASSED_INSPECTION
        )
      },
      order: {
        StatusUpdatedUtc: "ASC"
      }
    }))[0];

    if (!onLoadInvoice) {
      return;
    }

    const result = new CarForLoadDto();
    result.number = onLoadInvoice.CarNumber;
    result.entrance = onLoadInvoice.Entrance;

    return result;
  }

  async SetCancelLoadStatus(invoiceId: string): Promise<void> {
    const onLoadInvoice = await this.invoiceRepository.findOneBy({
      InvoiceId: Equal(
        invoiceId,
      ),
    });

    if (!onLoadInvoice) {
      return;
    }

    onLoadInvoice.Status = StatusesEnum.LOAD_END;
    onLoadInvoice.StatusUpdatedUtc = null;
    onLoadInvoice.Entrance = null;

    this.invoiceRepository.save(onLoadInvoice);
  }

  async SetArrivedStatus(invoiceId: string): Promise<void> {
    const arrivedInvoice = await this.invoiceRepository.findOneBy({
      InvoiceId: Equal(
        invoiceId,
      ),
    });

    if (!arrivedInvoice) {
      return;
    }

    arrivedInvoice.Status = StatusesEnum.ARRIVED;
    arrivedInvoice.StatusUpdatedUtc = moment(new Date()).toDate();

    this.invoiceRepository.save(arrivedInvoice);
  }

  async SetCheckPassStatus(invoiceId: string): Promise<void> {
    const checkInvoice = await this.invoiceRepository.findOneBy({
      InvoiceId: Equal(
        invoiceId,
      ),
    });

    if (!checkInvoice) {
      return;
    }

    checkInvoice.Status = StatusesEnum.PASSED_INSPECTION;
    checkInvoice.StatusUpdatedUtc = moment(new Date()).toDate();
    checkInvoice.MustBeOnCheckUtc = null;

    this.invoiceRepository.save(checkInvoice);
  }
}
