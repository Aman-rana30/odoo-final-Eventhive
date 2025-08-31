import jwt from 'jsonwebtoken';
import { config } from './src/config/env.js';

console.log('🔍 Debug Authentication Script');
console.log('📋 Environment variables:');
console.log('JWT_SECRET:', config.JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_EXPIRE:', config.JWT_EXPIRE);
console.log('NODE_ENV:', config.NODE_ENV);

// Test JWT verification
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NzQ5YzQ5YzQ5YzQ5YzQ5YzQ5YzQ5IiwiaWF0IjoxNzAyMjQ5NjAwLCJleHAiOjE3MDIyNTMyMDB9.invalid';

try {
  const decoded = jwt.verify(testToken, config.JWT_SECRET);
  console.log('✅ JWT verification working');
} catch (error) {
  console.log('❌ JWT verification error:', error.message);
}

console.log('🔍 Debug script completed');
