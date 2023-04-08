import { StatusesEnum } from "../entities/invoice.entity";

export class ProductDto {
  name: string;
  amount: number;
  units: string;
}

export class StoreInvoiceDto {
  invoiceId: string;
  carNumber: string;
  status: StatusesEnum;
  from: string;
  to: string;
  product: ProductDto;
}