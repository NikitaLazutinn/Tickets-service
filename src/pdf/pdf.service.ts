import { Injectable, NotFoundException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

@Injectable()
export class PdfService {
  async generateTicketPdf(ticket: any) {
    const doc = new PDFDocument();
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, `ticket_${Date.now()}.pdf`);

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      fs.writeFileSync(filePath, pdfBuffer);
    });

    doc.fontSize(12).text(`Ticket for Event ID: ${ticket.eventId}`);
    doc.text(`Seat: ${ticket.seatNumber}`);
    doc.text(`Price: ${ticket.price}`);
    doc.text(`Ticket ID: ${ticket.id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    const baseUrl = process.env.LOCALHOST_URL;
    const qrCodeData = `${baseUrl}/tickets/${ticket.id}/validate`;
    const qrCode = await QRCode.toDataURL(qrCodeData);
    doc.image(qrCode, { width: 100, height: 100 });

    doc.end();
    return filePath;
  }
}
