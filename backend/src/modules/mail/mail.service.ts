import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendInvoiceEmail(options: {
    to: string;
    senderName: string;
    senderEmail: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    pdfBuffer: Buffer;
  }): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(options.amount);
    const formattedDueDate = new Intl.DateTimeFormat('de-DE').format(new Date(options.dueDate));
    const fileName = `Rechnung-${options.invoiceNumber || 'ohne-nummer'}.pdf`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${options.senderName}" <${process.env.SMTP_FROM || options.senderEmail}>`,
      to: options.to,
      subject: `Rechnung ${options.invoiceNumber || ''} von ${options.senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Ihre Rechnung</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 16px;">Sehr geehrte Damen und Herren,</p>
            <p style="color: #374151;">im Anhang finden Sie Ihre Rechnung <strong>${options.invoiceNumber || ''}</strong> über <strong style="color: #6366f1;">${formattedAmount}</strong>.</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Rechnungsnummer:</td>
                  <td style="font-weight: bold; text-align: right;">${options.invoiceNumber || '-'}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Betrag:</td>
                  <td style="font-weight: bold; color: #6366f1; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Fälligkeitsdatum:</td>
                  <td style="font-weight: bold; color: #dc2626; text-align: right;">${formattedDueDate}</td>
                </tr>
              </table>
            </div>
            <p style="color: #374151;">Bitte überweisen Sie den Betrag bis zum angegebenen Fälligkeitsdatum.</p>
            <p style="color: #6b7280; font-size: 14px;">Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">${options.senderName} · ${options.senderEmail}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: options.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invoice email sent: ${info.messageId}`);
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Preview URL: ${previewUrl}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send invoice email: ${error.message}`);
      throw error;
    }
  }

  async sendQuoteEmail(options: {
    to: string;
    senderName: string;
    senderEmail: string;
    quoteNumber: string;
    amount: number;
    validUntil: Date;
    pdfBuffer: Buffer;
  }): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(options.amount);
    const formattedDate = new Intl.DateTimeFormat('de-DE').format(new Date(options.validUntil));
    const fileName = `Angebot-${options.quoteNumber || 'ohne-nummer'}.pdf`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${options.senderName}" <${process.env.SMTP_FROM || options.senderEmail}>`,
      to: options.to,
      subject: `Angebot ${options.quoteNumber || ''} von ${options.senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Ihr Angebot</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 16px;">Sehr geehrte Damen und Herren,</p>
            <p style="color: #374151;">im Anhang finden Sie unser Angebot <strong>${options.quoteNumber || ''}</strong> über <strong style="color: #10b981;">${formattedAmount}</strong>.</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Angebotsnummer:</td>
                  <td style="font-weight: bold; text-align: right;">${options.quoteNumber || '-'}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Betrag:</td>
                  <td style="font-weight: bold; color: #10b981; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Gültig bis:</td>
                  <td style="font-weight: bold; text-align: right;">${formattedDate}</td>
                </tr>
              </table>
            </div>
            <p style="color: #374151;">Wir freuen uns auf Ihre Rückmeldung.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">${options.senderName} · ${options.senderEmail}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: options.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Quote email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send quote email: ${error.message}`);
      throw error;
    }
  }

  async sendDunningEmail(options: {
    to: string;
    senderName: string;
    senderEmail: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    dunningLevel: number;
    pdfBuffer: Buffer;
  }): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(options.amount);
    const formattedDueDate = new Intl.DateTimeFormat('de-DE').format(new Date(options.dueDate));

    const dunningSubjects: Record<number, string> = {
      1: `Zahlungserinnerung: Rechnung ${options.invoiceNumber}`,
      2: `1. Mahnung: Rechnung ${options.invoiceNumber}`,
      3: `2. Mahnung: Rechnung ${options.invoiceNumber}`,
      4: `Letzte Mahnung: Rechnung ${options.invoiceNumber}`,
    };

    const dunningTexts: Record<number, string> = {
      1: 'Wir möchten Sie freundlich daran erinnern, dass die oben genannte Rechnung noch offen ist.',
      2: 'Trotz unserer Zahlungserinnerung haben wir leider noch keinen Zahlungseingang verzeichnen können. Wir bitten Sie, den offenen Betrag umgehend zu begleichen.',
      3: 'Da Sie trotz unserer Zahlungserinnerung und der ersten Mahnung die Rechnung noch nicht beglichen haben, senden wir Ihnen diese zweite Mahnung.',
      4: 'Dies ist unsere letzte Mahnung. Wenn wir den Betrag nicht innerhalb von 7 Tagen erhalten, müssen wir weitere Maßnahmen einleiten.',
    };

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${options.senderName}" <${process.env.SMTP_FROM || options.senderEmail}>`,
      to: options.to,
      subject: dunningSubjects[options.dunningLevel] || `Zahlungserinnerung: Rechnung ${options.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${options.dunningLevel === 1 ? 'Zahlungserinnerung' : `${options.dunningLevel - 1}. Mahnung`}</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151;">${dunningTexts[options.dunningLevel] || dunningTexts[1]}</p>
            <div style="background: white; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Rechnungsnummer:</td>
                  <td style="font-weight: bold; text-align: right;">${options.invoiceNumber || '-'}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Offener Betrag:</td>
                  <td style="font-weight: bold; color: #dc2626; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Ursprüngliches Fälligkeitsdatum:</td>
                  <td style="font-weight: bold; text-align: right;">${formattedDueDate}</td>
                </tr>
              </table>
            </div>
            <p style="color: #374151;">Bitte überweisen Sie den Betrag schnellstmöglich. Im Anhang finden Sie die ursprüngliche Rechnung.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">${options.senderName} · ${options.senderEmail}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Rechnung-${options.invoiceNumber || 'ohne-nummer'}.pdf`,
          content: options.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Dunning email (level ${options.dunningLevel}) sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send dunning email: ${error.message}`);
      throw error;
    }
  }
}
