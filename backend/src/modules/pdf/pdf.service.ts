import { Injectable } from '@nestjs/common';

export interface InvoiceData {
  invoiceNumber?: string;
  issueDate: Date;
  dueDate: Date;
  freelancer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  customer: {
    name: string;
    company?: string;
    email: string;
  };
  description: string;
  amount: number;
  publicToken?: string;
  bankDetails?: {
    name: string;
    bankName?: string;
    iban?: string;
    bic?: string;
    accountHolder?: string;
    isPaypal: boolean;
    paypalEmail?: string;
  };
}

export interface QuoteData {
  quoteNumber?: string;
  issueDate: Date;
  validUntil: Date;
  freelancer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  customer: {
    name: string;
    company?: string;
    email: string;
  };
  description: string;
  amount: number;
  notes?: string;
}

@Injectable()
export class PdfService {
  private getPrinter() {
    const Printer = require('pdfmake/js/Printer').default;
    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };
    return new Printer(fonts);
  }

  private async renderToPdf(docDefinition: any): Promise<Buffer> {
    const pdfDoc = await this.getPrinter().createPdfKitDocument(docDefinition);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {

    const vatAmount = data.amount * 0.19;
    const netAmount = data.amount / 1.19;

    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica', fontSize: 10, color: '#1a1a2e' },
      pageMargins: [50, 50, 50, 70],
      content: [
        // Header
        {
          columns: [
            {
              stack: [
                { text: `${data.freelancer.firstName} ${data.freelancer.lastName}`, fontSize: 18, bold: true, color: '#6366f1' },
                { text: data.freelancer.email, fontSize: 10, color: '#6b7280', margin: [0, 2, 0, 0] },
              ],
            },
            {
              stack: [
                { text: 'RECHNUNG', fontSize: 22, bold: true, alignment: 'right', color: '#1a1a2e' },
                {
                  text: data.invoiceNumber || 'Ohne Nummer',
                  fontSize: 12,
                  alignment: 'right',
                  color: '#6366f1',
                  margin: [0, 2, 0, 0],
                },
              ],
            },
          ],
          margin: [0, 0, 0, 30],
        },
        // Divider
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#6366f1' }], margin: [0, 0, 0, 20] },
        // Billing info
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'RECHNUNGSEMPFÄNGER', fontSize: 8, bold: true, color: '#6b7280', margin: [0, 0, 0, 6] },
                { text: data.customer.company || data.customer.name, bold: true, fontSize: 12 },
                ...(data.customer.company ? [{ text: data.customer.name, fontSize: 10, color: '#4b5563' }] : []),
                { text: data.customer.email, fontSize: 10, color: '#4b5563', margin: [0, 2, 0, 0] },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'RECHNUNGSDETAILS', fontSize: 8, bold: true, color: '#6b7280', margin: [0, 0, 0, 6] },
                {
                  table: {
                    widths: ['auto', '*'],
                    body: [
                      [
                        { text: 'Rechnungsdatum:', color: '#6b7280', fontSize: 9 },
                        { text: this.formatDate(data.issueDate), alignment: 'right', fontSize: 9 },
                      ],
                      [
                        { text: 'Fälligkeitsdatum:', color: '#6b7280', fontSize: 9 },
                        { text: this.formatDate(data.dueDate), alignment: 'right', bold: true, color: '#dc2626', fontSize: 9 },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 30],
        },
        // Items table
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 80],
            body: [
              [
                { text: 'LEISTUNGSBESCHREIBUNG', bold: true, fontSize: 9, color: '#ffffff', fillColor: '#6366f1', margin: [8, 8, 8, 8] },
                { text: 'EINZELPREIS', bold: true, fontSize: 9, color: '#ffffff', fillColor: '#6366f1', alignment: 'right', margin: [8, 8, 8, 8] },
                { text: 'BETRAG', bold: true, fontSize: 9, color: '#ffffff', fillColor: '#6366f1', alignment: 'right', margin: [8, 8, 8, 8] },
              ],
              [
                { text: data.description, margin: [8, 10, 8, 10] },
                { text: this.formatCurrency(data.amount), alignment: 'right', margin: [8, 10, 8, 10] },
                { text: this.formatCurrency(data.amount), alignment: 'right', margin: [8, 10, 8, 10] },
              ],
            ],
          },
          layout: {
            hLineColor: '#e5e7eb',
            vLineColor: '#e5e7eb',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
          },
          margin: [0, 0, 0, 20],
        },
        // Totals
        {
          alignment: 'right',
          stack: [
            {
              columns: [
                { text: 'Nettobetrag:', width: '*', alignment: 'right', color: '#6b7280', fontSize: 10 },
                { text: this.formatCurrency(netAmount), width: 100, alignment: 'right', color: '#6b7280', fontSize: 10 },
              ],
              margin: [0, 3, 0, 3],
            },
            {
              columns: [
                { text: 'MwSt. 19%:', width: '*', alignment: 'right', color: '#6b7280', fontSize: 10 },
                { text: this.formatCurrency(vatAmount), width: 100, alignment: 'right', color: '#6b7280', fontSize: 10 },
              ],
              margin: [0, 3, 0, 3],
            },
            { canvas: [{ type: 'line', x1: 315, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }], margin: [0, 5, 0, 5] },
            {
              columns: [
                { text: 'GESAMTBETRAG:', width: '*', alignment: 'right', bold: true, fontSize: 13 },
                { text: this.formatCurrency(data.amount), width: 100, alignment: 'right', bold: true, fontSize: 13, color: '#6366f1' },
              ],
            },
          ],
          margin: [0, 0, 0, 30],
        },
        // Note
        {
          text: 'Bitte überweisen Sie den Gesamtbetrag innerhalb der Zahlungsfrist unter Angabe der Rechnungsnummer.',
          fontSize: 9,
          color: '#6b7280',
          italics: true,
          margin: [0, 0, 0, 10],
        },
        // Bank Details
        ...(data.bankDetails ? [{
          text: data.bankDetails.isPaypal ?
            `Zahlbar via PayPal an: ${data.bankDetails.paypalEmail}` :
            `Bankverbindung: ${data.bankDetails.bankName || ''} · IBAN: ${data.bankDetails.iban} · BIC: ${data.bankDetails.bic} · Kontoinhaber: ${data.bankDetails.accountHolder}`,
          fontSize: 8,
          color: '#6b7280',
          alignment: 'center',
          margin: [0, 10, 0, 0],
        }] : []),
      ],
      footer: (currentPage: number, pageCount: number) => ({
        text: `${data.freelancer.firstName} ${data.freelancer.lastName}  ·  ${data.freelancer.email}  ·  Seite ${currentPage} von ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        color: '#9ca3af',
        margin: [0, 0, 0, 20],
      }),
    };

    return this.renderToPdf(docDefinition);
  }

  async generateQuotePdf(data: QuoteData): Promise<Buffer> {

    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica', fontSize: 10, color: '#1a1a2e' },
      pageMargins: [50, 50, 50, 70],
      content: [
        {
          columns: [
            {
              stack: [
                { text: `${data.freelancer.firstName} ${data.freelancer.lastName}`, fontSize: 18, bold: true, color: '#10b981' },
                { text: data.freelancer.email, fontSize: 10, color: '#6b7280', margin: [0, 2, 0, 0] },
              ],
            },
            {
              stack: [
                { text: 'ANGEBOT', fontSize: 22, bold: true, alignment: 'right', color: '#1a1a2e' },
                {
                  text: data.quoteNumber || 'Ohne Nummer',
                  fontSize: 12,
                  alignment: 'right',
                  color: '#10b981',
                  margin: [0, 2, 0, 0],
                },
              ],
            },
          ],
          margin: [0, 0, 0, 30],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#10b981' }], margin: [0, 0, 0, 20] },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'AN', fontSize: 8, bold: true, color: '#6b7280', margin: [0, 0, 0, 6] },
                { text: data.customer.company || data.customer.name, bold: true, fontSize: 12 },
                ...(data.customer.company ? [{ text: data.customer.name, fontSize: 10, color: '#4b5563' }] : []),
                { text: data.customer.email, fontSize: 10, color: '#4b5563', margin: [0, 2, 0, 0] },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'ANGEBOTSDETAILS', fontSize: 8, bold: true, color: '#6b7280', margin: [0, 0, 0, 6] },
                {
                  table: {
                    widths: ['auto', '*'],
                    body: [
                      [
                        { text: 'Angebotsdatum:', color: '#6b7280', fontSize: 9 },
                        { text: this.formatDate(data.issueDate), alignment: 'right', fontSize: 9 },
                      ],
                      [
                        { text: 'Gültig bis:', color: '#6b7280', fontSize: 9 },
                        { text: this.formatDate(data.validUntil), alignment: 'right', bold: true, fontSize: 9 },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 30],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 80],
            body: [
              [
                { text: 'LEISTUNGSBESCHREIBUNG', bold: true, fontSize: 9, color: '#ffffff', fillColor: '#10b981', margin: [8, 8, 8, 8] },
                { text: 'PREIS', bold: true, fontSize: 9, color: '#ffffff', fillColor: '#10b981', alignment: 'right', margin: [8, 8, 8, 8] },
                { text: 'GESAMT', bold: true, fontSize: 9, color: '#ffffff', fillColor: '#10b981', alignment: 'right', margin: [8, 8, 8, 8] },
              ],
              [
                { text: data.description, margin: [8, 10, 8, 10] },
                { text: this.formatCurrency(data.amount), alignment: 'right', margin: [8, 10, 8, 10] },
                { text: this.formatCurrency(data.amount), alignment: 'right', margin: [8, 10, 8, 10] },
              ],
            ],
          },
          layout: { hLineColor: '#e5e7eb', vLineColor: '#e5e7eb', hLineWidth: () => 1, vLineWidth: () => 1 },
          margin: [0, 0, 0, 20],
        },
        {
          alignment: 'right',
          stack: [
            {
              columns: [
                { text: 'ANGEBOTSBETRAG:', width: '*', alignment: 'right', bold: true, fontSize: 13 },
                { text: this.formatCurrency(data.amount), width: 100, alignment: 'right', bold: true, fontSize: 13, color: '#10b981' },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        ...(data.notes ? [{ text: `Hinweise: ${data.notes}`, fontSize: 9, color: '#6b7280', italics: true }] : []),
        { text: 'Dieses Angebot ist freibleibend. Bei Fragen stehe ich Ihnen gerne zur Verfügung.', fontSize: 9, color: '#6b7280', italics: true, margin: [0, 10, 0, 0] },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        text: `${data.freelancer.firstName} ${data.freelancer.lastName}  ·  ${data.freelancer.email}  ·  Seite ${currentPage} von ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        color: '#9ca3af',
        margin: [0, 0, 0, 20],
      }),
    };

    return this.renderToPdf(docDefinition);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  }
}
