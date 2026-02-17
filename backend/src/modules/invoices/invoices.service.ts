import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceStatus, RecurringInterval } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, ownerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: createInvoiceDto.customerId, ownerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found or access denied');
    }

    if (createInvoiceDto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: createInvoiceDto.projectId, ownerId },
      });
      if (!project) {
        throw new NotFoundException('Project not found or access denied');
      }
    }

    const isRecurring = createInvoiceDto.isRecurring || false;
    let nextInvoiceDate: Date | undefined;

    if (isRecurring && createInvoiceDto.recurringInterval && createInvoiceDto.recurringStartDate) {
      nextInvoiceDate = this.calculateNextInvoiceDate(
        new Date(createInvoiceDto.recurringStartDate),
        createInvoiceDto.recurringInterval as RecurringInterval,
      );
    }

    return this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        amount: createInvoiceDto.amount,
        ownerId,
        status: createInvoiceDto.status || InvoiceStatus.DRAFT,
        issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
        dueDate: new Date(createInvoiceDto.dueDate),
        isRecurring,
        recurringInterval: createInvoiceDto.recurringInterval as RecurringInterval | undefined,
        recurringStartDate: createInvoiceDto.recurringStartDate ? new Date(createInvoiceDto.recurringStartDate) : undefined,
        recurringEndDate: createInvoiceDto.recurringEndDate ? new Date(createInvoiceDto.recurringEndDate) : undefined,
        nextInvoiceDate,
      },
      include: { customer: true, payments: true },
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

    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.from || filters?.to) {
      where.issueDate = {};
      if (filters.from) where.issueDate.gte = new Date(filters.from);
      if (filters.to) where.issueDate.lte = new Date(filters.to);
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        project: { select: { id: true, name: true } },
        payments: true,
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, ownerId },
      include: {
        customer: true,
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found or access denied');
    }

    return invoice;
  }

  async findByPublicToken(token: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { publicToken: token },
      include: {
        customer: { select: { name: true, company: true, email: true } },
        owner: { select: { firstName: true, lastName: true, email: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, ownerId: string) {
    await this.findOne(id, ownerId);

    if (updateInvoiceDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: updateInvoiceDto.customerId, ownerId },
      });
      if (!customer) throw new NotFoundException('Customer not found or access denied');
    }

    if (updateInvoiceDto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: updateInvoiceDto.projectId, ownerId },
      });
      if (!project) throw new NotFoundException('Project not found or access denied');
    }

    const updateData: any = { ...updateInvoiceDto };
    if (updateInvoiceDto.dueDate) updateData.dueDate = new Date(updateInvoiceDto.dueDate);
    if (updateInvoiceDto.issueDate) updateData.issueDate = new Date(updateInvoiceDto.issueDate);
    if (updateInvoiceDto.recurringStartDate) updateData.recurringStartDate = new Date(updateInvoiceDto.recurringStartDate);
    if (updateInvoiceDto.recurringEndDate) updateData.recurringEndDate = new Date(updateInvoiceDto.recurringEndDate);

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { customer: true, payments: true },
    });
  }

  async remove(id: string, ownerId: string) {
    const invoice = await this.findOne(id, ownerId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new ForbiddenException(
        'Only DRAFT invoices can be deleted. Use status update for other invoices.',
      );
    }

    await this.prisma.invoice.delete({ where: { id } });
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
      include: { customer: true, payments: true },
    });
  }

  async downloadPdf(id: string, ownerId: string): Promise<Buffer> {
    const invoice = await this.findOne(id, ownerId);
    const owner = await this.prisma.user.findUniqueOrThrow({ where: { id: ownerId } });

    return this.pdfService.generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber || undefined,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      freelancer: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
      },
      customer: {
        name: invoice.customer.name,
        company: invoice.customer.company || undefined,
        email: invoice.customer.email,
      },
      description: invoice.description,
      amount: Number(invoice.amount),
      publicToken: invoice.publicToken || undefined,
    });
  }

  async sendInvoiceByEmail(id: string, ownerId: string): Promise<{ message: string }> {
    const invoice = await this.findOne(id, ownerId);
    const owner = await this.prisma.user.findUniqueOrThrow({ where: { id: ownerId } });

    const pdfBuffer = await this.pdfService.generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber || undefined,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      freelancer: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
      },
      customer: {
        name: invoice.customer.name,
        company: invoice.customer.company || undefined,
        email: invoice.customer.email,
      },
      description: invoice.description,
      amount: Number(invoice.amount),
    });

    await this.mailService.sendInvoiceEmail({
      to: invoice.customer.email,
      senderName: `${owner.firstName} ${owner.lastName}`,
      senderEmail: owner.email,
      invoiceNumber: invoice.invoiceNumber || 'Ohne Nummer',
      amount: Number(invoice.amount),
      dueDate: invoice.dueDate,
      pdfBuffer,
    });

    // Update status to SENT if still DRAFT
    if (invoice.status === InvoiceStatus.DRAFT) {
      await this.prisma.invoice.update({
        where: { id },
        data: { status: InvoiceStatus.SENT },
      });
    }

    return { message: `Invoice sent to ${invoice.customer.email}` };
  }

  async recalculateStatus(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    let newStatus = invoice.status;
    const invoiceAmount = Number(invoice.amount);

    if (totalPaid === 0) {
      if (invoice.status === InvoiceStatus.SENT && invoice.dueDate < new Date()) {
        newStatus = InvoiceStatus.OVERDUE;
      }
    } else if (totalPaid >= invoiceAmount) {
      newStatus = InvoiceStatus.PAID;
    } else {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus, totalPaid },
      include: { customer: true, payments: true },
    });
  }

  @Cron('0 2 * * *')
  async markOverdueInvoices() {
    const now = new Date();
    const result = await this.prisma.invoice.updateMany({
      where: { status: InvoiceStatus.SENT, dueDate: { lt: now } },
      data: { status: InvoiceStatus.OVERDUE },
    });
    console.log(`Marked ${result.count} invoices as overdue`);
    return result;
  }

  /**
   * Cron job for automatic dunning — runs daily at 8 AM
   * Levels: 1=reminder(3d), 2=1st notice(10d), 3=2nd notice(20d), 4=final(30d)
   */
  @Cron('0 8 * * *')
  async processDunning() {
    const now = new Date();
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: { status: InvoiceStatus.OVERDUE, dunningLevel: { lt: 4 } },
      include: {
        customer: true,
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const dunningDays = [3, 10, 20, 30];

    for (const invoice of overdueInvoices) {
      const daysSinceDue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const nextLevel = invoice.dunningLevel + 1;

      if (nextLevel > 4) continue;

      const requiredDays = dunningDays[nextLevel - 1];
      const lastDunningDaysAgo = invoice.lastDunningDate
        ? Math.floor((now.getTime() - invoice.lastDunningDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Send dunning if enough days have passed since due date (and since last dunning)
      const shouldSend =
        daysSinceDue >= requiredDays &&
        (lastDunningDaysAgo === null || lastDunningDaysAgo >= 7);

      if (shouldSend) {
        try {
          const pdfBuffer = await this.pdfService.generateInvoicePdf({
            invoiceNumber: invoice.invoiceNumber || undefined,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            freelancer: {
              firstName: invoice.owner.firstName,
              lastName: invoice.owner.lastName,
              email: invoice.owner.email,
            },
            customer: {
              name: invoice.customer.name,
              company: invoice.customer.company || undefined,
              email: invoice.customer.email,
            },
            description: invoice.description,
            amount: Number(invoice.amount),
          });

          await this.mailService.sendDunningEmail({
            to: invoice.customer.email,
            senderName: `${invoice.owner.firstName} ${invoice.owner.lastName}`,
            senderEmail: invoice.owner.email,
            invoiceNumber: invoice.invoiceNumber || 'Ohne Nummer',
            amount: Number(invoice.amount),
            dueDate: invoice.dueDate,
            dunningLevel: nextLevel,
            pdfBuffer,
          });

          await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { dunningLevel: nextLevel, lastDunningDate: now },
          });

          console.log(`Sent dunning level ${nextLevel} for invoice ${invoice.id}`);
        } catch (error) {
          console.error(`Failed to send dunning for invoice ${invoice.id}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Cron job to generate recurring invoices — runs daily at 6 AM
   */
  @Cron('0 6 * * *')
  async generateRecurringInvoices() {
    const now = new Date();
    const recurringTemplates = await this.prisma.invoice.findMany({
      where: {
        isRecurring: true,
        nextInvoiceDate: { lte: now },
        OR: [{ recurringEndDate: null }, { recurringEndDate: { gte: now } }],
      },
      include: { customer: true },
    });

    for (const template of recurringTemplates) {
      try {
        // Create new invoice from template
        const newInvoice = await this.prisma.invoice.create({
          data: {
            ownerId: template.ownerId,
            customerId: template.customerId,
            projectId: template.projectId,
            invoiceNumber: undefined,
            amount: template.amount,
            description: template.description,
            status: InvoiceStatus.DRAFT,
            issueDate: now,
            dueDate: this.calculateDueDate(now, 30),
            isRecurring: false,
            parentInvoiceId: template.id,
          },
        });

        // Update next invoice date on template
        const nextDate = this.calculateNextInvoiceDate(now, template.recurringInterval!);
        await this.prisma.invoice.update({
          where: { id: template.id },
          data: { nextInvoiceDate: nextDate },
        });

        console.log(`Generated recurring invoice ${newInvoice.id} from template ${template.id}`);
      } catch (error) {
        console.error(`Failed to generate recurring invoice from ${template.id}: ${error.message}`);
      }
    }
  }

  async getOverdue(ownerId: string) {
    return this.prisma.invoice.findMany({
      where: { ownerId, status: InvoiceStatus.OVERDUE },
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  private calculateNextInvoiceDate(from: Date, interval: RecurringInterval): Date {
    const next = new Date(from);
    switch (interval) {
      case RecurringInterval.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case RecurringInterval.QUARTERLY:
        next.setMonth(next.getMonth() + 3);
        break;
      case RecurringInterval.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  private calculateDueDate(from: Date, days: number): Date {
    const due = new Date(from);
    due.setDate(due.getDate() + days);
    return due;
  }
}
