import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  async generateTicketPdf(ticket: any) {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `ticket_${Date.now()}.pdf`);

    const qrCodeData = `${process.env.LOCALHOST_URL}/tickets/${ticket.id}/validate`;
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate QR code:');
    }

    const templatePath = path.join(
      process.cwd(),
      'src',
      'pdf',
      'templates',
      'ticket-template.html',
    );

    let ticketHtml = fs.readFileSync(templatePath, 'utf-8');

    ticketHtml = ticketHtml
      .replace('{{posterUrl}}', ticket.posterUrl || '')
      .replace('{{eventTitle}}', ticket.eventTitle)
      .replace('{{date}}', ticket.date)
      .replace('{{location}}', ticket.location)
      .replace('{{seat}}', ticket.seat)
      .replace('{{price}}', ticket.price)
      .replace('{{qrCodeDataUrl}}', qrCodeDataUrl);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(ticketHtml);

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    await browser.close();

    return filePath;
  }
}
