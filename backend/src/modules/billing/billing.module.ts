import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { ConfigModule } from '@nestjs/config';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
    imports: [ConfigModule, InvoicesModule],
    controllers: [BillingController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule { }
