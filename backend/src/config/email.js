import * as nodemailer from 'nodemailer';
import { config } from './env.js';

let transporter = null;

// Initialize email transporter with better error handling
const initializeTransporter = () => {
  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    console.log('📧 Email credentials not configured');
    return null;
  }

  try {
    const transportConfig = {
      service: config.EMAIL_SERVICE,
      host: config.EMAIL_HOST,
      port: parseInt(config.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    console.log('📧 Initializing email transporter with config:', {
      service: transportConfig.service,
      host: transportConfig.host,
      port: transportConfig.port,
      user: transportConfig.auth.user
    });

    transporter = nodemailer.createTransport(transportConfig);
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('📧 Email transporter verification failed:', error.message);
        console.log('📧 Troubleshooting tips:');
        console.log('1. Make sure you\'re using an App Password (not your regular Gmail password)');
        console.log('2. Enable 2-Factor Authentication on your Gmail account');
        console.log('3. Generate an App Password: https://myaccount.google.com/apppasswords');
        console.log('4. Make sure "Less secure app access" is enabled (if not using App Password)');
      } else {
        console.log('📧 Email transporter verified successfully');
      }
    });

    return transporter;
  } catch (error) {
    console.error('📧 Failed to initialize email transporter:', error.message);
    return null;
  }
};

// Initialize transporter on module load
transporter = initializeTransporter();

export const sendEmail = async (to, subject, html, attachments = []) => {
  if (!transporter) {
    console.log('📧 Email not configured, skipping send to:', to);
    return { success: false, message: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: config.EMAIL_FROM || config.EMAIL_USER,
      to,
      subject,
      html,
      attachments
    };

    console.log('📧 Attempting to send email to:', to);
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('📧 Email send error:', error.message);
    
    // Provide specific troubleshooting advice based on error
    if (error.message.includes('Invalid login') || error.message.includes('535-5.7.8')) {
      console.log('📧 Gmail Authentication Error - Solutions:');
      console.log('1. Use App Password instead of regular password');
      console.log('2. Enable 2-Factor Authentication');
      console.log('3. Generate App Password: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('📧 Network Error - Check internet connection and SMTP settings');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('📧 Connection Refused - Check SMTP port and firewall settings');
    }
    
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
