import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto, ownerId: string) {
    // Verify customer ownership
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: createInvoiceDto.customerId,
        ownerId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found or access denied');
    }

    return this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        amount: createInvoiceDto.amount,
        ownerId,
        status: createInvoiceDto.status || InvoiceStatus.DRAFT,
        issueDate: createInvoiceDto.issueDate
          ? new Date(createInvoiceDto.issueDate)
          : new Date(),
        dueDate: new Date(createInvoiceDto.dueDate),
      },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  async findAll(
    ownerId: string,
    filters?: {
      status?: InvoiceStatus;
      customerId?: string;
      from?: string;
      to?: string;
    },
  ) {
    const where: any = { ownerId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.from || filters?.to) {
      where.issueDate = {};
      if (filters.from) {
        where.issueDate.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.issueDate.lte = new Date(filters.to);
      }
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        payments: true,
        _count: {
          select: { payments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, ownerId },
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found or access denied');
    }

    return invoice;
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    ownerId: string,
  ) {
    // Verify ownership
    await this.findOne(id, ownerId);

    // If customer is being changed, verify new customer ownership
    if (updateInvoiceDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: {
          id: updateInvoiceDto.customerId,
          ownerId,
        },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found or access denied');
      }
    }

    const updateData: any = { ...updateInvoiceDto };

    if (updateInvoiceDto.dueDate) {
      updateData.dueDate = new Date(updateInvoiceDto.dueDate);
    }

    if (updateInvoiceDto.issueDate) {
      updateData.issueDate = new Date(updateInvoiceDto.issueDate);
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  async remove(id: string, ownerId: string) {
    const invoice = await this.findOne(id, ownerId);

    // Only allow deletion of DRAFT invoices
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new ForbiddenException(
        'Only DRAFT invoices can be deleted. Use status update for other invoices.',
      );
    }

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { message: 'Invoice deleted successfully' };
  }

  async sendInvoice(id: string, ownerId: string) {
    const invoice = await this.findOne(id, ownerId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be sent');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  /**
   * Recalculate invoice status based on payments
   * Called after payment create/update/delete
   */
  async recalculateStatus(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Calculate total paid
    const totalPaid = invoice.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    let newStatus = invoice.status;
    const invoiceAmount = Number(invoice.amount);

    if (totalPaid === 0) {
      // No payments - check if overdue
      if (
        invoice.status === InvoiceStatus.SENT &&
        invoice.dueDate < new Date()
      ) {
        newStatus = InvoiceStatus.OVERDUE;
      }
      // Keep DRAFT or SENT status
    } else if (totalPaid >= invoiceAmount) {
      newStatus = InvoiceStatus.PAID;
    } else {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    // Update invoice
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus,
        totalPaid,
      },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  /**
   * Cron job to mark overdue invoices
   * Runs daily at 2 AM
   */
  @Cron('0 2 * * *')
  async markOverdueInvoices() {
    const now = new Date();

    const result = await this.prisma.invoice.updateMany({
      where: {
        status: InvoiceStatus.SENT,
        dueDate: { lt: now },
        totalPaid: { lt: this.prisma.invoice.fields.amount },
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });

    console.log(`Marked ${result.count} invoices as overdue`);
    return result;
  }

  /**
   * Get overdue invoices for a user
   */
  async getOverdue(ownerId: string) {
    return this.prisma.invoice.findMany({
      where: {
        ownerId,
        status: InvoiceStatus.OVERDUE,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
