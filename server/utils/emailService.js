const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendTicketConfirmation(to, eventDetails, tickets) {
    const mailOptions = {
      from: `EventMitra <${process.env.EMAIL_USER}>`,
      to,
      subject: `Your tickets for ${eventDetails.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🎉 Booking Confirmed!</h2>

          <p>Dear Customer,</p>
          <p>Your booking for <strong>${eventDetails.title}</strong> has been confirmed!</p>

          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Event Details</h3>
            <p><strong>📅 Date:</strong> ${new Date(eventDetails.startDate).toLocaleDateString()}</p>
            <p><strong>⏰ Time:</strong> ${eventDetails.startTime || 'TBD'}</p>
            <p><strong>📍 Venue:</strong> ${eventDetails.venue.name}</p>
            <p><strong>📧 Total Tickets:</strong> ${tickets.length}</p>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Your digital tickets are available in your EventMitra account</li>
            <li>Present your QR code at the venue for entry</li>
            <li>Arrive 30 minutes before the event starts</li>
          </ul>

          <p>Thank you for choosing EventMitra!</p>
          <p style="color: #6B7280; font-size: 14px;">For support, contact: support@eventmitra.com</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendEventReminder(to, eventDetails, timeUntilEvent) {
    const mailOptions = {
      from: `EventMitra <${process.env.EMAIL_USER}>`,
      to,
      subject: `Reminder: ${eventDetails.title} ${timeUntilEvent}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">⏰ Event Reminder</h2>

          <p>Don't forget about your upcoming event!</p>

          <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0;">
            <h3 style="color: #991B1B; margin-top: 0;">${eventDetails.title}</h3>
            <p><strong>📅 Date:</strong> ${new Date(eventDetails.startDate).toLocaleDateString()}</p>
            <p><strong>⏰ Time:</strong> ${eventDetails.startTime || 'TBD'}</p>
            <p><strong>📍 Venue:</strong> ${eventDetails.venue.name}</p>
            <p><strong>📍 Address:</strong> ${eventDetails.venue.address}</p>
          </div>

          <p><strong>Important:</strong></p>
          <ul>
            <li>Have your QR ticket ready on your phone</li>
            <li>Check traffic conditions before leaving</li>
            <li>Arrive 30 minutes early for smooth entry</li>
          </ul>

          <p>Have a great time at the event!</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(to, resetURL) {
    const mailOptions = {
      from: `EventMitra <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Password Reset Request - EventMitra',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🔒 Password Reset Request</h2>

          <p>You requested a password reset for your EventMitra account.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
          </p>

          <p style="color: #6B7280; font-size: 12px;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            ${resetURL}
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
