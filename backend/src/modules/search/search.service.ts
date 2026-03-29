import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
}

export interface SearchResponse {
  results: Record<string, SearchResult[]>;
  total: number;
}

const fmt = (v: { toString(): string } | number | string) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v.toString()));

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string, userId: string): Promise<SearchResponse> {
    if (!q || q.trim().length < 2) {
      return { results: {}, total: 0 };
    }

    const term = q.trim();
    const contains = (field: string) => ({ contains: field, mode: 'insensitive' as const });

    const [customers, projects, invoices, quotes, appointments, expenses, timeEntries] =
      await Promise.all([
        // Kunden
        this.prisma.customer.findMany({
          where: {
            ownerId: userId,
            OR: [
              { name: contains(term) },
              { company: contains(term) },
              { email: contains(term) },
            ],
          },
          take: 5,
          orderBy: { name: 'asc' },
        }),

        // Projekte
        this.prisma.project.findMany({
          where: {
            ownerId: userId,
            OR: [{ name: contains(term) }, { description: contains(term) }],
          },
          take: 5,
          include: { customer: { select: { name: true } } },
          orderBy: { name: 'asc' },
        }),

        // Rechnungen
        this.prisma.invoice.findMany({
          where: {
            ownerId: userId,
            OR: [
              { invoiceNumber: contains(term) },
              { description: contains(term) },
              { customer: { name: contains(term) } },
            ],
          },
          take: 5,
          include: { customer: { select: { name: true } } },
          orderBy: { issueDate: 'desc' },
        }),

        // Angebote
        this.prisma.quote.findMany({
          where: {
            ownerId: userId,
            OR: [
              { quoteNumber: contains(term) },
              { description: contains(term) },
              { notes: contains(term) },
              { customer: { name: contains(term) } },
            ],
          },
          take: 5,
          include: { customer: { select: { name: true } } },
          orderBy: { issueDate: 'desc' },
        }),

        // Kalender
        this.prisma.appointment.findMany({
          where: {
            ownerId: userId,
            OR: [{ title: contains(term) }, { description: contains(term) }],
          },
          take: 5,
          orderBy: { startTime: 'desc' },
        }),

        // Ausgaben
        this.prisma.expense.findMany({
          where: {
            ownerId: userId,
            description: contains(term),
          },
          take: 5,
          orderBy: { date: 'desc' },
        }),

        // Zeiterfassung (description nullable – Prisma ignoriert null bei contains automatisch)
        this.prisma.timeEntry.findMany({
          where: {
            ownerId: userId,
            description: contains(term),
          },
          take: 5,
          include: { project: { select: { name: true } } },
          orderBy: { startTime: 'desc' },
        }),
      ]);

    const results: Record<string, SearchResult[]> = {};

    if (customers.length) {
      results.customer = customers.map((c) => ({
        id: c.id,
        type: 'customer',
        title: c.name,
        subtitle: [c.company, c.email].filter(Boolean).join(' · '),
        href: `/customers`,
      }));
    }

    if (projects.length) {
      results.project = projects.map((p) => ({
        id: p.id,
        type: 'project',
        title: p.name,
        subtitle: p.customer?.name ?? 'Kein Kunde',
        meta: p.status,
        href: `/projects`,
      }));
    }

    if (invoices.length) {
      results.invoice = invoices.map((i) => ({
        id: i.id,
        type: 'invoice',
        title: i.invoiceNumber ?? i.description.slice(0, 40),
        subtitle: i.customer.name,
        meta: `${fmt(i.amount)} · ${i.status}`,
        href: `/invoices`,
      }));
    }

    if (quotes.length) {
      results.quote = quotes.map((q) => ({
        id: q.id,
        type: 'quote',
        title: q.quoteNumber ?? q.description.slice(0, 40),
        subtitle: q.customer.name,
        meta: `${fmt(q.amount)} · ${q.status}`,
        href: `/quotes`,
      }));
    }

    if (appointments.length) {
      results.appointment = appointments.map((a) => ({
        id: a.id,
        type: 'appointment',
        title: a.title,
        subtitle: fmtDate(a.startTime),
        href: `/appointments`,
      }));
    }

    if (expenses.length) {
      results.expense = expenses.map((e) => ({
        id: e.id,
        type: 'expense',
        title: e.description,
        subtitle: e.category,
        meta: fmt(e.amount),
        href: `/expenses`,
      }));
    }

    if (timeEntries.length) {
      results.time_entry = timeEntries.map((t) => ({
        id: t.id,
        type: 'time_entry',
        title: t.description ?? 'Zeiteintrag',
        subtitle: t.project?.name ?? 'Kein Projekt',
        meta: fmtDate(t.startTime),
        href: `/time-tracking`,
      }));
    }

    const total = Object.values(results).reduce((s, arr) => s + arr.length, 0);
    return { results, total };
  }
}
