import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../config/env.js';

export const generateQRCode = async (data) => {
  try {
    console.log('📱 Starting QR code generation...');
    console.log('📋 Data to encode:', data.substring(0, 100) + '...');
    
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
    
    console.log('✅ QR code generated successfully');
    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ QR Code generation failed:', error);
    console.error('❌ Error stack:', error.stack);
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

export const generateSecureQRPayload = (bookingId, eventId) => {
  try {
    console.log('🔐 Starting secure QR payload generation...');
    console.log('📋 Input:', { bookingId, eventId });
    
    const timestamp = Date.now();
    const data = `${bookingId}:${eventId}:${timestamp}`;
    
    console.log('🔑 Using QR_SECRET:', config.QR_SECRET ? 'Set' : 'Not set');
    
    const hash = crypto
      .createHmac('sha256', config.QR_SECRET)
      .update(data)
      .digest('hex');
    
    const payload = JSON.stringify({
      bookingId,
      eventId,
      timestamp,
      hash
    });
    
    console.log('✅ Secure QR payload generated');
    return payload;
  } catch (error) {
    console.error('❌ Secure QR payload generation failed:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
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