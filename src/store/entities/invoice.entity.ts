import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { ProductEntity } from "./product.entity";

export enum StatusesEnum {
  CREATED = 0,
  ARRIVED = 1,
  INVITED = 2,
  PASSED_INSPECTION = 3,
  ON_INTERNAL_PARKING = 4,
  ON_LOAD = 5,
  LOAD_END = 10
}

@Entity({ name: 'Invoices' })
export class InvoiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  Id: number;

  @Column()
  InvoiceId: number;

  @Column({
    nullable: false,
  })
  CarNumber: string;

  @Column()
  DriverFullName: string;

  @ManyToOne(type => ProductEntity)
  @JoinColumn({ name: 'productId' })
  Product: ProductEntity;

  @RelationId((invoice: InvoiceEntity) => invoice.Product)
  ProductId: number;

  @Column()
  From: Date;

  @Column()
  To: Date;

  @Column({ enum: StatusesEnum })
  Status: StatusesEnum;

  @Column()
  StatusUpdatedUtc: Date;

  @Column()
  MustBeOnCheckUtc: Date;
}