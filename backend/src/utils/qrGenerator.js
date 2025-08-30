import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../config/env.js';

export const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

export const generateSecureQRPayload = (bookingId, eventId) => {
  const timestamp = Date.now();
  const data = `${bookingId}:${eventId}:${timestamp}`;
  const hash = crypto
    .createHmac('sha256', config.QR_SECRET)
    .update(data)
    .digest('hex');
  
  return JSON.stringify({
    bookingId,
    eventId,
    timestamp,
    hash
  });
};

export const verifyQRPayload = (payload) => {
  try {
    const data = JSON.parse(payload);
    const { bookingId, eventId, timestamp, hash } = data;
    
    // Check if QR is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - timestamp > maxAge) {
      return { valid: false, error: 'QR code expired' };
    }
    
    // Verify hash
    const expectedHash = crypto
      .createHmac('sha256', config.QR_SECRET)
      .update(`${bookingId}:${eventId}:${timestamp}`)
      .digest('hex');
    
    if (hash !== expectedHash) {
      return { valid: false, error: 'Invalid QR code' };
    }
    
    return { valid: true, bookingId, eventId };
  } catch (error) {
    return { valid: false, error: 'Invalid QR code format' };
  }
};
```