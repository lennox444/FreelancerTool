import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('BankAccounts')
@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
    constructor(private readonly service: BankAccountsService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateBankAccountDto) {
        return this.service.create(req.user.id, dto);
    }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.service.findOne(req.user.id, id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
        return this.service.update(req.user.id, id, dto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.service.remove(req.user.id, id);
    }
}
