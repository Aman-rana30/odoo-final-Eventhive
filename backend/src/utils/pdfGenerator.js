import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { generateQRCode, generateSecureQRPayload } from './qrGenerator.js';

export const generateTicketPDF = async (booking, event) => {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `ticket-${booking.bookingId}.pdf`;
    const filepath = path.join('uploads', 'tickets', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create write stream
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    // Header
    doc.fontSize(24).fillColor('#3B82F6').text('EventHive', 50, 50);
    doc.fontSize(20).fillColor('#000').text('Event Ticket', 50, 80);
    
    // Event details
    doc.fontSize(18).text(event.title, 50, 130);
    doc.fontSize(12).fillColor('#666');
    doc.text(`Booking ID: ${booking.bookingId}`, 50, 160);
    doc.text(`Date: ${new Date(event.startAt).toLocaleDateString()}`, 50, 180);
    doc.text(`Time: ${new Date(event.startAt).toLocaleTimeString()}`, 50, 200);
    doc.text(`Venue: ${event.venue.address}, ${event.venue.city}`, 50, 220);
    
    // Attendee info
    doc.fillColor('#000').fontSize(14).text('Attendee Information', 50, 260);
    doc.fontSize(12).fillColor('#666');
    doc.text(`Name: ${booking.attendeeInfo.name}`, 50, 280);
    doc.text(`Email: ${booking.attendeeInfo.email}`, 50, 300);
    doc.text(`Phone: ${booking.attendeeInfo.phone}`, 50, 320);
    
    // Ticket details
    doc.fillColor('#000').fontSize(14).text('Ticket Details', 50, 360);
    doc.fontSize(12).fillColor('#666');
    let yPos = 380;
    booking.items.forEach((item, index) => {
      doc.text(`Ticket ${index + 1}: ${item.quantity}x - ₹${item.priceAtPurchase}`, 50, yPos);
      yPos += 20;
    });
    doc.text(`Total Amount: ₹${booking.total}`, 50, yPos + 10);
    
    // QR Code
    const qrPayload = generateSecureQRPayload(booking.bookingId, event._id.toString());
    const qrDataURL = await generateQRCode(qrPayload);
    const qrBuffer = Buffer.from(qrDataURL.split(',')[1], 'base64');
    
    doc.fillColor('#000').fontSize(14).text('Scan at Event Entrance', 350, 360);
    doc.image(qrBuffer, 350, 380, { width: 150, height: 150 });
    
    // Footer
    doc.fontSize(10).fillColor('#999').text(
      'This is your official ticket. Please present this at the event entrance.',
      50, 700,
      { width: 500, align: 'center' }
    );
    
    doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(filepath);
      });
      stream.on('error', reject);
    });
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};