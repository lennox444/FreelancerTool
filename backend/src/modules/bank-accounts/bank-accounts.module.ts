import { Module } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsController } from './bank-accounts.controller';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [BankAccountsController],
    providers: [BankAccountsService],
    exports: [BankAccountsService],
})
export class BankAccountsModule { }
