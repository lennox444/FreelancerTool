import { Injectable } from '@nestjs/common';
import * as iconv from 'iconv-lite';

// SKR03 account mapping for expenses
const EXPENSE_ACCOUNT_MAP: Record<string, string> = {
  SOFTWARE:  '4980',
  HARDWARE:  '0680',
  TRAVEL:    '4660',
  MARKETING: '4610',
  OFFICE:    '4930',
  TRAINING:  '4900',
  OTHER:     '4980',
};

const REVENUE_ACCOUNT = '8400'; // Erlöse 19% USt

/**
 * Generates DATEV Buchungsstapel (EXTF) CSV for invoices.
 * Returns a Windows-1252 encoded Buffer ready for download.
 */
@Injectable()
export class DatevExportService {
  /**
   * Build DATEV EXTF header row
   */
  private buildHeader(recordType: string, fiscalYear: number): string {
    const now = new Date();
    const created = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}000`;
    // Row 1: EXTF header
    const header1 = [
      '"EXTF"',  // Kennzeichen
      '510',     // Versionsnummer
      '21',      // Datenkategorie (21 = Buchungsstapel)
      `"${recordType}"`,
      '9',       // Format-Version
      created,   // Erstellt am
      '',        // Importiert
      '"FreelancerTool"', // Herkunft
      '',
      '',
      '1001',    // Beraternummer (Demo)
      '1',       // Mandantennummer (Demo)
      `${fiscalYear}0101`, // WJ-Beginn
      '4',       // Sachkontenlänge
      `${fiscalYear}0101`, // Von Datum
      `${fiscalYear}1231`, // Bis Datum
      `"Export ${fiscalYear}"`, // Bezeichnung
      '',
      '1',       // Festschreibung 0=nein
      'EUR',     // Währungskennzeichen
      '',
      '',
      '',
      '',
      '',
      '',
    ].join(';');

    // Row 2: column headers
    const header2 = [
      'Umsatz (ohne Soll/Haben-Kz)',
      'Soll/Haben-Kennzeichen',
      'WKZ Umsatz',
      'Kurs',
      'Basis-Umsatz',
      'WKZ Basis-Umsatz',
      'Konto',
      'Gegenkonto (ohne BU-Schlüssel)',
      'BU-Schlüssel',
      'Belegdatum',
      'Belegfeld 1',
      'Belegfeld 2',
      'Skonto',
      'Buchungstext',
      'Postensperre',
      'Diverse Adressnummer',
      'Geschäftspartnerbank',
      'Sachverhalt',
      'Zinssperre',
      'Beleglink',
      'Beleginfo - Art 1',
      'Beleginfo - Inhalt 1',
      'Beleginfo - Art 2',
      'Beleginfo - Inhalt 2',
      'Beleginfo - Art 3',
      'Beleginfo - Inhalt 3',
      'Beleginfo - Art 4',
      'Beleginfo - Inhalt 4',
      'Beleginfo - Art 5',
      'Beleginfo - Inhalt 5',
      'Beleginfo - Art 6',
      'Beleginfo - Inhalt 6',
      'Beleginfo - Art 7',
      'Beleginfo - Inhalt 7',
      'Beleginfo - Art 8',
      'Beleginfo - Inhalt 8',
      'KOST1 - Kostenstelle',
      'KOST2 - Kostenstelle',
      'Kost-Menge',
      'EU-Mitgliedstaat u. UStIdNr.',
      'EU-Steuersatz',
      'Abw. Versteuerungsart',
      'Sachkonten-Start',
      'Notizen',
      'Stückzahl',
      'Gewicht',
      'Zahlweise',
      'Forderungsart',
      'Veranlagungsjahr',
      'Zugeordnete Fälligkeit',
      'Skontotyp',
      'Auftragsnummer',
      'Land',
      'Abrechnungsreferenz',
      'BVV-Position',
      'EU-Mitgliedstaat Steuersatz 1',
      'EU-Steuersatz 1',
    ].map(h => `"${h}"`).join(';');

    return header1 + '\r\n' + header2;
  }

  private formatAmount(amount: number): string {
    // DATEV expects comma as decimal separator
    return amount.toFixed(2).replace('.', ',');
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    // DDMM format
    return `${day}${month}`;
  }

  private escapeCsv(value: string): string {
    if (!value) return '""';
    return `"${value.replace(/"/g, '""').replace(/;/g, ' ')}"`;
  }

  /**
   * Generate DATEV export for invoices (PAID + PARTIALLY_PAID)
   */
  generateInvoicesDATEV(invoices: any[], year: number): Buffer {
    const lines: string[] = [this.buildHeader('Buchungsstapel', year)];

    for (const inv of invoices) {
      const amount = Number(inv.totalPaid ?? inv.amount ?? 0);
      if (amount <= 0) continue;

      const belegdatum = this.formatDate(inv.issueDate || inv.createdAt);
      const belegfeld1 = inv.invoiceNumber ? inv.invoiceNumber.replace(/[^a-zA-Z0-9\-_]/g, '') : inv.id.substring(0, 12);
      const buchungstext = inv.customer?.name
        ? `Rechnung ${inv.customer.name}`.substring(0, 60)
        : 'Rechnung';

      // Columns matching the header row
      const row = [
        this.formatAmount(amount), // Umsatz
        'H',                       // Soll/Haben: H = Haben (Einnahme)
        'EUR',                     // WKZ
        '',                        // Kurs
        '',                        // Basis-Umsatz
        '',                        // WKZ Basis-Umsatz
        REVENUE_ACCOUNT,           // Konto (Erlöskonto 8400)
        '10000',                   // Gegenkonto (Debitor, Demo)
        '',                        // BU-Schlüssel
        belegdatum,                // Belegdatum DDMM
        this.escapeCsv(belegfeld1),// Belegfeld 1
        '',                        // Belegfeld 2
        '',                        // Skonto
        this.escapeCsv(buchungstext), // Buchungstext
      ];

      // Pad remaining columns
      while (row.length < 56) row.push('');

      lines.push(row.join(';'));
    }

    const csv = lines.join('\r\n');
    return iconv.encode(csv, 'win1252');
  }

  /**
   * Generate DATEV export for expenses
   */
  generateExpensesDATEV(expenses: any[], year: number): Buffer {
    const lines: string[] = [this.buildHeader('Buchungsstapel', year)];

    for (const exp of expenses) {
      const amount = Number(exp.amount ?? 0);
      if (amount <= 0) continue;

      const account = EXPENSE_ACCOUNT_MAP[exp.category] ?? '4980';
      const belegdatum = this.formatDate(exp.date || exp.createdAt);
      const belegfeld1 = exp.id.substring(0, 12);
      const buchungstext = (exp.description || exp.category || 'Ausgabe').substring(0, 60);

      const row = [
        this.formatAmount(amount), // Umsatz
        'S',                       // Soll/Haben: S = Soll (Ausgabe)
        'EUR',                     // WKZ
        '',                        // Kurs
        '',                        // Basis-Umsatz
        '',                        // WKZ Basis-Umsatz
        account,                   // Konto (Aufwandskonto)
        '1600',                    // Gegenkonto (Kreditor, Demo)
        '',                        // BU-Schlüssel
        belegdatum,                // Belegdatum DDMM
        this.escapeCsv(belegfeld1),// Belegfeld 1
        '',                        // Belegfeld 2
        '',                        // Skonto
        this.escapeCsv(buchungstext), // Buchungstext
      ];

      while (row.length < 56) row.push('');

      lines.push(row.join(';'));
    }

    const csv = lines.join('\r\n');
    return iconv.encode(csv, 'win1252');
  }
}
