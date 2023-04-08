import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity, ProductEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, ProductEntity])],
  controllers: [StoreController],
  providers: [StoreService]
})
export class StoreModule {}
