const twilio = require('twilio');
const axios = require('axios');

class NotificationService {
  constructor() {
    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  // Send SMS notification
  async sendSMS(to, message) {
    try {
      if (!this.twilioClient) {
        console.warn('Twilio not configured, skipping SMS');
        return false;
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      console.log('SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  // Send WhatsApp notification
  async sendWhatsApp(to, message) {
    try {
      if (!this.twilioClient) {
        console.warn('Twilio not configured, skipping WhatsApp');
        return false;
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${to}`
      });

      console.log('WhatsApp sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  }

  // Send push notification (placeholder for future Firebase integration)
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // TODO: Implement Firebase Cloud Messaging
      console.log('Push notification would be sent to user:', userId);
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Data:', data);

      return true;
    } catch (error) {
      console.error('Push notification error:', error);
      return false;
    }
  }

  // Send booking confirmation notifications
  async sendBookingConfirmation(user, event, tickets) {
    const smsMessage = `Hi ${user.firstName}! Your booking for "${event.title}" is confirmed. ${tickets.length} ticket(s) booked. Event: ${new Date(event.startDate).toLocaleDateString()}. Check your email for tickets.`;

    const whatsappMessage = `🎉 Booking Confirmed!\n\n${event.title}\n📅 ${new Date(event.startDate).toLocaleDateString()}\n📍 ${event.venue.name}\n🎫 ${tickets.length} ticket(s)\n\nYour digital tickets are ready in your EventMitra account!`;

    // Send both SMS and WhatsApp
    await Promise.all([
      this.sendSMS(user.phone, smsMessage),
      this.sendWhatsApp(user.phone, whatsappMessage),
      this.sendPushNotification(user._id, 'Booking Confirmed!', `Your tickets for ${event.title} are ready`, {
        eventId: event._id,
        orderId: tickets[0].order
      })
    ]);
  }

  // Send event reminders
  async sendEventReminder(user, event, timeUntilEvent) {
    const smsMessage = `⏰ Reminder: "${event.title}" ${timeUntilEvent}! 📍 ${event.venue.name}. Have your QR ticket ready. Arrive 30 mins early.`;

    const whatsappMessage = `⏰ Don't forget!\n\n${event.title}\n${timeUntilEvent}\n\n📅 ${new Date(event.startDate).toLocaleDateString()}\n⏰ ${event.startTime || 'TBD'}\n📍 ${event.venue.name}\n\n✅ Have your QR ticket ready\n✅ Arrive 30 minutes early`;

    await Promise.all([
      this.sendSMS(user.phone, smsMessage),
      this.sendWhatsApp(user.phone, whatsappMessage),
      this.sendPushNotification(user._id, 'Event Reminder', `${event.title} ${timeUntilEvent}`, {
        eventId: event._id
      })
    ]);
  }

  // Send check-in confirmation
  async sendCheckInConfirmation(user, event) {
    const message = `✅ You're checked in to "${event.title}"! Enjoy the event! 🎉`;

    await Promise.all([
      this.sendPushNotification(user._id, 'Checked In!', `Welcome to ${event.title}`, {
        eventId: event._id
      })
    ]);
  }
}

module.exports = new NotificationService();
