import axios from 'axios';
import { config } from './env.js';

const whatsappCloudAPI = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  headers: {
    'Authorization': `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

export const sendWhatsAppMessage = async (to, message, type = 'text', mediaUrl = null) => {
  if (!config.WHATSAPP_ACCESS_TOKEN || !config.WHATSAPP_PHONE_NUMBER_ID) {
    console.log('📱 WhatsApp not configured, skipping send to:', to);
    return { success: false, message: 'WhatsApp not configured' };
  }

  try {
    // Remove + and spaces from phone number
    const cleanPhone = to.replace(/[\s+-]/g, '');
    
    let messageData = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: type
    };

    if (type === 'text') {
      messageData.text = { body: message };
    } else if (type === 'document' && mediaUrl) {
      messageData.document = {
        link: mediaUrl,
        caption: message
      };
    }

    const response = await whatsappCloudAPI.post(
      `/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      messageData
    );

    console.log('📱 WhatsApp message sent successfully:', response.data.messages[0].id);
    return { success: true, messageId: response.data.messages[0].id };
  } catch (error) {
    console.error('📱 WhatsApp send error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
};

export const generateTicketWhatsAppMessage = (booking, event) => {
  return `🎟️ *EventHive Ticket Confirmation*

Hello ${booking.attendeeInfo.name}!

Your booking for *${event.title}* is confirmed!

📋 *Booking Details:*
• Booking ID: ${booking.bookingId}
• Date: ${new Date(event.startAt).toLocaleDateString()}
• Time: ${new Date(event.startAt).toLocaleTimeString()}
• Venue: ${event.venue.address}, ${event.venue.city}
• Amount Paid: ₹${booking.total}

Your ticket PDF has been emailed to you. Please show it at the event entrance.

Thank you for choosing EventHive! 🎉`;
};