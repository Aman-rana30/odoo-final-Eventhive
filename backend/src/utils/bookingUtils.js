import { v4 as uuidv4 } from 'uuid';

export const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EH${timestamp}${random}`;
};

export const calculateItemTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

export const validateBookingItems = (items) => {
  if (!items || items.length === 0) {
    throw new Error('At least one item is required');
  }

  for (const item of items) {
    if (!item.ticketTypeId || !item.quantity || item.quantity < 1) {
      throw new Error('Invalid item data');
    }
  }
};

export const formatBookingForEmail = (booking, event) => {
  return {
    bookingId: booking.bookingId,
    eventTitle: event.title,
    eventDate: new Date(event.startAt).toLocaleDateString(),
    eventTime: new Date(event.startAt).toLocaleTimeString(),
    venue: `${event.venue.address}, ${event.venue.city}`,
    attendeeName: booking.attendeeInfo.name,
    total: booking.total,
    items: booking.items
  };
};

export const getRefundPolicy = (eventStartAt) => {
  const now = new Date();
  const hoursUntilEvent = (eventStartAt - now) / (1000 * 60 * 60);

  if (hoursUntilEvent >= 48) {
    return { 
      allowed: true, 
      percentage: 100, 
      message: 'Full refund available' 
    };
  } else if (hoursUntilEvent >= 24) {
    return { 
      allowed: true, 
      percentage: 50, 
      message: '50% refund available' 
    };
  } else {
    return { 
      allowed: false, 
      percentage: 0, 
      message: 'No refund available' 
    };
  }
};