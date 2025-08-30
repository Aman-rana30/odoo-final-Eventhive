import nodemailer from 'nodemailer';
import { config } from './env.js';

let transporter = null;

if (config.EMAIL_USER && config.EMAIL_PASS) {
  transporter = nodemailer.createTransporter({
    service: config.EMAIL_SERVICE,
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    }
  });
}

export const sendEmail = async (to, subject, html, attachments = []) => {
  if (!transporter) {
    console.log('📧 Email not configured, skipping send to:', to);
    return { success: false, message: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
      attachments
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('📧 Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const generateTicketEmailHTML = (booking, event) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your EventHive Ticket</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; text-align: center; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .ticket-info { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎟️ Your EventHive Ticket</h1>
        </div>
        <div class="content">
          <h2>Booking Confirmed!</h2>
          <div class="ticket-info">
            <h3>${event.title}</h3>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Date:</strong> ${new Date(event.startAt).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(event.startAt).toLocaleTimeString()}</p>
            <p><strong>Venue:</strong> ${event.venue.address}, ${event.venue.city}</p>
            <p><strong>Total Amount:</strong> ₹${booking.total}</p>
          </div>
          <p>Your ticket is attached as a PDF. Please show this at the event entrance.</p>
          <p>Thank you for choosing EventHive!</p>
        </div>
        <div class="footer">
          <p>EventHive - Making Events Memorable</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
```