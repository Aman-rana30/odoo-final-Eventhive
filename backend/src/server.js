import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cron from 'node-cron';

import { config } from './config/env.js';
import { connectDB } from './config/database.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { requestLogger } from './middlewares/requestLogger.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import checkinRoutes from './routes/checkinRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

// Jobs
import { reminderJob } from './jobs/reminderJob.js';
import { trendingJob } from './jobs/trendingJob.js';

const app = express();

// Connect to database
connectDB();

// Trust proxy for accurate client IP
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization
app.use(mongoSanitize());

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Schedule cron jobs
cron.schedule('0 * * * *', reminderJob); // Every hour
cron.schedule('0 */2 * * *', trendingJob); // Every 2 hours

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 EventHive backend server running on port ${PORT}`);
  console.log(`📱 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
});

export default app;