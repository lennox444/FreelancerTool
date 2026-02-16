import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, ownerId: string) {
    // Verify invoice ownership
    const invoice = await this.invoicesService.findOne(
      createPaymentDto.invoiceId,
      ownerId,
    );

    // Check if payment amount is valid
    const remainingAmount =
      Number(invoice.amount) - Number(invoice.totalPaid);
    if (createPaymentDto.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount (${createPaymentDto.amount}) exceeds remaining invoice amount (${remainingAmount})`,
      );
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        amount: createPaymentDto.amount,
        ownerId,
        paymentDate: createPaymentDto.paymentDate
          ? new Date(createPaymentDto.paymentDate)
          : new Date(),
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    // Trigger invoice status recalculation
    await this.invoicesService.recalculateStatus(createPaymentDto.invoiceId);

    return payment;
  }

  async findAll(
    ownerId: string,
    filters?: {
      invoiceId?: string;
      from?: string;
      to?: string;
    },
  ) {
    const where: any = { ownerId };

    if (filters?.invoiceId) {
      where.invoiceId = filters.invoiceId;
    }

    if (filters?.from || filters?.to) {
      where.paymentDate = {};
      if (filters.from) {
        where.paymentDate.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.paymentDate.lte = new Date(filters.to);
      }
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, ownerId },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found or access denied');
    }

    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    ownerId: string,
  ) {
    const payment = await this.findOne(id, ownerId);

    // If invoice is being changed, verify new invoice ownership
    if (updatePaymentDto.invoiceId) {
      await this.invoicesService.findOne(updatePaymentDto.invoiceId, ownerId);
    }

    const updateData: any = { ...updatePaymentDto };

    if (updatePaymentDto.paymentDate) {
      updateData.paymentDate = new Date(updatePaymentDto.paymentDate);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    // Recalculate status for old invoice if invoice changed
    if (updatePaymentDto.invoiceId && payment.invoiceId !== updatePaymentDto.invoiceId) {
      await this.invoicesService.recalculateStatus(payment.invoiceId);
    }

    // Recalculate status for current invoice
    await this.invoicesService.recalculateStatus(updatedPayment.invoiceId);

    return updatedPayment;
  }

  async remove(id: string, ownerId: string) {
    const payment = await this.findOne(id, ownerId);

    await this.prisma.payment.delete({
      where: { id },
    });

    // Recalculate invoice status after payment deletion
    await this.invoicesService.recalculateStatus(payment.invoiceId);

    return { message: 'Payment deleted successfully' };
  }

  /**
   * Get total paid amount for an invoice
   */
  async getTotalPaid(invoiceId: string): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  /**
   * Get payment statistics for a user
   */
  async getStats(ownerId: string, from?: Date, to?: Date) {
    const where: any = { ownerId };

    if (from || to) {
      where.paymentDate = {};
      if (from) where.paymentDate.gte = from;
      if (to) where.paymentDate.lte = to;
    }

    const [totalAmount, count] = await Promise.all([
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      totalAmount: Number(totalAmount._sum.amount || 0),
      count,
    };
  }
}
