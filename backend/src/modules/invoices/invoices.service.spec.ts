import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../core/database/prisma.service';
import { InvoiceStatus } from '@prisma/client';

describe('InvoicesService - Status Calculation', () => {
  let service: InvoicesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    invoice: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recalculateStatus', () => {
    it('should keep status as SENT when no payments and not overdue', async () => {
      const invoiceId = 'invoice-1';
      const mockInvoice = {
        id: invoiceId,
        amount: 1000,
        status: InvoiceStatus.SENT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
        payments: [],
      };

      mockPrismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoice.update.mockResolvedValue({
        ...mockInvoice,
        totalPaid: 0,
      });

      const result = await service.recalculateStatus(invoiceId);

      expect(result.status).toBe(InvoiceStatus.SENT);
      expect(result.totalPaid).toBe(0);
    });

    it('should change status to OVERDUE when no payments and past due date', async () => {
      const invoiceId = 'invoice-2';
      const mockInvoice = {
        id: invoiceId,
        amount: 1000,
        status: InvoiceStatus.SENT,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days in past
        payments: [],
      };

      mockPrismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.OVERDUE,
        totalPaid: 0,
      });

      const result = await service.recalculateStatus(invoiceId);

      expect(result.status).toBe(InvoiceStatus.OVERDUE);
      expect(result.totalPaid).toBe(0);
    });

    it('should change status to PARTIALLY_PAID when partial payment made', async () => {
      const invoiceId = 'invoice-3';
      const mockInvoice = {
        id: invoiceId,
        amount: 1000,
        status: InvoiceStatus.SENT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        payments: [{ amount: 500 }],
      };

      mockPrismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.PARTIALLY_PAID,
        totalPaid: 500,
      });

      const result = await service.recalculateStatus(invoiceId);

      expect(result.status).toBe(InvoiceStatus.PARTIALLY_PAID);
      expect(result.totalPaid).toBe(500);
    });

    it('should change status to PAID when fully paid', async () => {
      const invoiceId = 'invoice-4';
      const mockInvoice = {
        id: invoiceId,
        amount: 1000,
        status: InvoiceStatus.SENT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        payments: [{ amount: 600 }, { amount: 400 }],
      };

      mockPrismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.PAID,
        totalPaid: 1000,
      });

      const result = await service.recalculateStatus(invoiceId);

      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(result.totalPaid).toBe(1000);
    });

    it('should change status to PAID when overpaid', async () => {
      const invoiceId = 'invoice-5';
      const mockInvoice = {
        id: invoiceId,
        amount: 1000,
        status: InvoiceStatus.PARTIALLY_PAID,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        payments: [{ amount: 600 }, { amount: 500 }],
      };

      mockPrismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.PAID,
        totalPaid: 1100,
      });

      const result = await service.recalculateStatus(invoiceId);

      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(result.totalPaid).toBe(1100);
    });

    it('should handle DRAFT status correctly (no status change)', async () => {
      const invoiceId = 'invoice-6';
      const mockInvoice = {
        id: invoiceId,
        amount: 1000,
        status: InvoiceStatus.DRAFT,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Past due
        payments: [],
      };

      mockPrismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoice.update.mockResolvedValue({
        ...mockInvoice,
        totalPaid: 0,
      });

      const result = await service.recalculateStatus(invoiceId);

      // DRAFT should not change to OVERDUE
      expect(result.status).toBe(InvoiceStatus.DRAFT);
    });

    it('should calculate totalPaid correctly with decimal amounts', async () => {
      const invoiceId = 'invoice-7';
      const mockInvoice = {
        id: invoiceId,
        amount: 1500.50,
        status: InvoiceStatus.SENT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        payments: [{ amount: 750.25 }, { amount: 250.15 }],
      };

      mockPrismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.PARTIALLY_PAID,
        totalPaid: 1000.40,
      });

      const result = await service.recalculateStatus(invoiceId);

      expect(result.status).toBe(InvoiceStatus.PARTIALLY_PAID);
      expect(result.totalPaid).toBe(1000.40);
    });
  });

  describe('markOverdueInvoices (Cron Job)', () => {
    it('should mark SENT invoices as OVERDUE when past due date', async () => {
      mockPrismaService.invoice.updateMany.mockResolvedValue({ count: 3 });

      await service.markOverdueInvoices();

      expect(mockPrismaService.invoice.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: InvoiceStatus.SENT,
            dueDate: expect.objectContaining({ lt: expect.any(Date) }),
          }),
          data: { status: InvoiceStatus.OVERDUE },
        }),
      );
    });
  });
});
