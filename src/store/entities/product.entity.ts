import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UnitsEnum {
    KG = 0,
    T = 1,
}

@Entity({name: 'Products'})
export class ProductEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  Id: number;

  @Column({
    nullable: false,
  })
  Name: string;

  @Column({enum: UnitsEnum})
  Units: UnitsEnum;
}