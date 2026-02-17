import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';

@Injectable()
export class BankAccountsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateBankAccountDto) {
        // If setting as default, unset others first
        if (dto.isDefault) {
            await this.prisma.bankAccount.updateMany({
                where: { ownerId: userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        // If this is the *first* account, make it default automatically
        const count = await this.prisma.bankAccount.count({ where: { ownerId: userId } });
        const isDefault = count === 0 ? true : dto.isDefault;

        return this.prisma.bankAccount.create({
            data: {
                ...dto,
                isDefault,
                ownerId: userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.bankAccount.findMany({
            where: { ownerId: userId },
            orderBy: { isDefault: 'desc' }, // default first
        });
    }

    async findOne(userId: string, id: string) {
        const account = await this.prisma.bankAccount.findFirst({
            where: { id, ownerId: userId },
        });
        if (!account) throw new NotFoundException('Bank account not found');
        return account;
    }

    async update(userId: string, id: string, dto: UpdateBankAccountDto) {
        const account = await this.prisma.bankAccount.findFirst({
            where: { id, ownerId: userId },
        });
        if (!account) throw new NotFoundException('Bank account not found');

        if (dto.isDefault) {
            await this.prisma.bankAccount.updateMany({
                where: { ownerId: userId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        return this.prisma.bankAccount.update({
            where: { id },
            data: dto,
        });
    }

    async remove(userId: string, id: string) {
        const account = await this.prisma.bankAccount.findFirst({
            where: { id, ownerId: userId },
        });
        if (!account) throw new NotFoundException('Bank account not found');

        return this.prisma.bankAccount.delete({
            where: { id },
        });
    }
}
