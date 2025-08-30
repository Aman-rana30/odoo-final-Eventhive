import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { sendEmail } from '../config/email.js';
import { sendWhatsAppMessage } from '../config/whatsapp.js';

export const reminderJob = async () => {
  try {
    console.log('📅 Running reminder job...');
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    // Find events starting in 24 hours
    const events24h = await Event.find({
      startAt: {
        $gte: in24Hours,
        $lt: new Date(in24Hours.getTime() + 60 * 60 * 1000) // 1 hour window
      },
      status: 'Published'
    });

    // Find events starting in 1 hour
    const events1h = await Event.find({
      startAt: {
        $gte: in1Hour,
        $lt: new Date(in1Hour.getTime() + 30 * 60 * 1000) // 30 minute window
      },
      status: 'Published'
    });

    // Send 24-hour reminders
    for (const event of events24h) {
      await this.sendEventReminders(event, '24 hours');
    }

    // Send 1-hour reminders
    for (const event of events1h) {
      await this.sendEventReminders(event, '1 hour');
    }

    console.log(`📅 Reminder job completed - 24h: ${events24h.length}, 1h: ${events1h.length}`);
  } catch (error) {
    console.error('📅 Reminder job error:', error);
  }
};

const sendEventReminders = async (event, timeframe) => {
  try {
    const bookings = await Booking.find({
      eventId: event._id,
      status: 'Paid'
    });

    for (const booking of bookings) {
      const subject = `Reminder: ${event.title} starts in ${timeframe}`;
      const emailContent = `
        <h2>Event Reminder</h2>
        <p>Hi ${booking.attendeeInfo.name},</p>
        <p>This is a reminder that <strong>${event.title}</strong> starts in ${timeframe}.</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Date: ${new Date(event.startAt).toLocaleDateString()}</li>
          <li>Time: ${new Date(event.startAt).toLocaleTimeString()}</li>
          <li>Venue: ${event.venue.address}, ${event.venue.city}</li>
        </ul>
        <p>Please arrive on time and have your ticket ready.</p>
        <p>Thank you!</p>
      `;

      const whatsappMessage = `🎟️ *Event Reminder*

Hi ${booking.attendeeInfo.name}!

Your event *${event.title}* starts in ${timeframe}.

📅 ${new Date(event.startAt).toLocaleDateString()}
🕐 ${new Date(event.startAt).toLocaleTimeString()}
📍 ${event.venue.address}, ${event.venue.city}

Please arrive on time and have your ticket ready. See you there! 🎉`;

      // Send email reminder
      await sendEmail(booking.attendeeInfo.email, subject, emailContent);
      
      // Send WhatsApp reminder
      await sendWhatsAppMessage(booking.attendeeInfo.phone, whatsappMessage);
    }
  } catch (error) {
    console.error(`Reminder send error for event ${event._id}:`, error);
  }
};