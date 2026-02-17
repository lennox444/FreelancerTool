import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteStatus, InvoiceStatus } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateQuoteDto, ownerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, ownerId },
    });
    if (!customer) throw new NotFoundException('Customer not found or access denied');

    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, ownerId },
      });
      if (!project) throw new NotFoundException('Project not found or access denied');
    }

    return this.prisma.quote.create({
      data: {
        ownerId,
        customerId: dto.customerId,
        projectId: dto.projectId,
        amount: dto.amount,
        description: dto.description,
        quoteNumber: dto.quoteNumber,
        notes: dto.notes,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        validUntil: new Date(dto.validUntil),
        status: QuoteStatus.DRAFT,
      },
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(ownerId: string, filters?: { status?: QuoteStatus; customerId?: string }) {
    const where: any = { ownerId };
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;

    return this.prisma.quote.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, ownerId },
      include: {
        customer: true,
        project: { select: { id: true, name: true } },
      },
    });
    if (!quote) throw new NotFoundException('Quote not found or access denied');
    return quote;
  }

  async update(id: string, dto: UpdateQuoteDto, ownerId: string) {
    await this.findOne(id, ownerId);

    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, ownerId },
      });
      if (!customer) throw new NotFoundException('Customer not found or access denied');
    }

    const updateData: any = { ...dto };
    if (dto.validUntil) updateData.validUntil = new Date(dto.validUntil);
    if (dto.issueDate) updateData.issueDate = new Date(dto.issueDate);

    return this.prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, ownerId: string) {
    const quote = await this.findOne(id, ownerId);
    if (quote.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('Cannot delete a converted quote');
    }
    await this.prisma.quote.delete({ where: { id } });
    return { message: 'Quote deleted successfully' };
  }

  async sendQuote(id: string, ownerId: string) {
    const quote = await this.findOne(id, ownerId);
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT quotes can be sent');
    }
    return this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.SENT },
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async updateStatus(id: string, ownerId: string, status: QuoteStatus) {
    await this.findOne(id, ownerId);
    return this.prisma.quote.update({
      where: { id },
      data: { status },
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async downloadPdf(id: string, ownerId: string): Promise<Buffer> {
    const quote = await this.findOne(id, ownerId);
    const owner = await this.prisma.user.findUniqueOrThrow({ where: { id: ownerId } });

    return this.pdfService.generateQuotePdf({
      quoteNumber: quote.quoteNumber || undefined,
      issueDate: quote.issueDate,
      validUntil: quote.validUntil,
      freelancer: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
      },
      customer: {
        name: quote.customer.name,
        company: quote.customer.company || undefined,
        email: quote.customer.email,
      },
      description: quote.description,
      amount: Number(quote.amount),
      notes: quote.notes || undefined,
    });
  }

  async sendByEmail(id: string, ownerId: string): Promise<{ message: string }> {
    const quote = await this.findOne(id, ownerId);
    const owner = await this.prisma.user.findUniqueOrThrow({ where: { id: ownerId } });

    const pdfBuffer = await this.downloadPdf(id, ownerId);

    await this.mailService.sendQuoteEmail({
      to: quote.customer.email,
      senderName: `${owner.firstName} ${owner.lastName}`,
      senderEmail: owner.email,
      quoteNumber: quote.quoteNumber || 'Ohne Nummer',
      amount: Number(quote.amount),
      validUntil: quote.validUntil,
      pdfBuffer,
    });

    if (quote.status === QuoteStatus.DRAFT) {
      await this.prisma.quote.update({
        where: { id },
        data: { status: QuoteStatus.SENT },
      });
    }

    return { message: `Quote sent to ${quote.customer.email}` };
  }

  /**
   * Convert quote to invoice (one-click)
   */
  async convertToInvoice(id: string, ownerId: string) {
    const quote = await this.findOne(id, ownerId);

    if (quote.status === QuoteStatus.REJECTED || quote.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('This quote cannot be converted to an invoice');
    }

    if (quote.convertedToInvoiceId) {
      throw new BadRequestException('Quote has already been converted to an invoice');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: quote.customerId },
    });

    // Due date = validUntil + 30 days (or 30 days from now if validUntil is in the past)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (customer?.defaultPaymentTerms || 30));

    const invoice = await this.prisma.invoice.create({
      data: {
        ownerId,
        customerId: quote.customerId,
        projectId: quote.projectId,
        amount: quote.amount,
        description: quote.description,
        status: InvoiceStatus.DRAFT,
        issueDate: new Date(),
        dueDate,
      },
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        payments: true,
      },
    });

    // Mark quote as converted
    await this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.CONVERTED,
        convertedToInvoiceId: invoice.id,
      },
    });

    return invoice;
  }
}
