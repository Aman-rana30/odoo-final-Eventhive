# Team Number : 24  

Video Link 🎥:  
[Click here to watch demo](https://drive.google.com/file/d/1uQUYpNrKgU0pXhcg6a2pwKYX2sCbJZEd/view?usp=sharing)

# EventHive - Complete Event Management Platform

A comprehensive MERN stack event management platform with advanced booking, payment processing, and real-time analytics.

## 🚀 Features

### Core Features
- **Event Management**: Complete CRUD with draft/publish workflows
- **Multi-Ticket Booking**: Support for General, VIP, Student, and Early Bird tickets
- **Payment Integration**: Razorpay (primary) with Stripe fallback
- **Ticket Generation**: PDF tickets with secure QR codes
- **Notifications**: Email & WhatsApp with automated reminders
- **Check-In System**: Real-time QR scanner with duplicate prevention
- **Analytics**: Comprehensive reporting with data export
- **Role-Based Access**: Admin, EventManager, Volunteer, Attendee roles

### Technical Features
- **Frontend**: React + Vite + Tailwind CSS 3.4.17
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT with refresh tokens
- **Security**: Rate limiting, input sanitization, CORS
- **File Upload**: Multer for event cover images
- **Cron Jobs**: Automated reminders and trending calculations

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (local or Atlas)
- Razorpay account (for payments)
- Gmail account (for email notifications)
- WhatsApp Cloud API access (optional)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cd backend
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/eventhive

# JWT Secrets (generate strong secrets for production)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Payment Gateway
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

# WhatsApp (optional)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

### 3. Database Setup

Start MongoDB and seed sample data:

```bash
# Seed the database with sample data
npm run seed
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🎯 Default User Accounts

After seeding, you can login with these accounts:

- **Admin**: admin@eventhive.com / password123
- **Event Manager**: manager@eventhive.com / password123  
- **Volunteer**: volunteer@eventhive.com / password123
- **Attendee**: attendee@eventhive.com / password123

## 🔧 Configuration

### Payment Gateway Setup

1. **Razorpay** (Primary):
   - Create account at https://razorpay.com
   - Get API keys from Dashboard > Settings > API Keys
   - Add to .env file

2. **Stripe** (Fallback):
   - Create account at https://stripe.com
   - Get secret key from Dashboard
   - Set PAYMENT_GATEWAY=stripe in .env

### Email Configuration

1. Enable 2-factor authentication on Gmail
2. Generate app password: Account > Security > App passwords
3. Use app password in EMAIL_PASS

### WhatsApp Integration

1. Setup WhatsApp Cloud API via Meta Developer Console
2. Get access token and phone number ID
3. Add to .env file

## 📁 Project Structure

```
eventhive/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, payment, email configs
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   ├── utils/          # Helpers, QR, PDF generation
│   │   ├── jobs/           # Cron jobs
│   │   └── server.js       # Express app entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── context/        # Auth and cart context
│   │   ├── hooks/          # Custom React hooks
│   │   ├── api/            # API client and React Query
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   └── package.json
└── README.md
```

## 🚀 Production Deployment

### Backend Deployment

```bash
cd backend
npm run build
npm start
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting provider
```

## 🧪 Testing

Run the test suite:

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

## 📊 API Documentation

Key API endpoints:

- `GET /api/events` - Browse events with filters
- `POST /api/checkout/create-order` - Create payment order
- `POST /api/checkin/scan` - QR code check-in
- `GET /api/reports/sales` - Sales analytics

## 🔒 Security Features

- JWT authentication with refresh tokens
- Rate limiting (100 requests per 15 minutes)
- Input sanitization and validation
- CORS configuration
- Secure password hashing
- QR code tamper protection

## 🎫 Ticket Features

- PDF generation with event details and QR codes
- Email delivery with HTML receipts
- WhatsApp notifications
- Secure QR codes with HMAC verification
- Anti-duplicate check-in system

## 💳 Payment Features

- Razorpay integration (UPI, cards, net banking, wallets)
- Stripe fallback support
- Webhook verification for security
- Refund processing with inventory rollback
- Coupon and discount system

## 📱 Mobile Features

- Responsive design for all screen sizes
- Touch-optimized interfaces
- Mobile QR scanner for check-ins
- Progressive Web App capabilities

## 🎯 Business Logic

- **Inventory Management**: Atomic ticket quantity updates
- **Refund Policy**: Time-based refund percentages
- **Loyalty System**: Points for bookings and referrals
- **Trending Algorithm**: Weighted scoring based on user actions
- **Discount Engine**: Multiple coupon types with validation

## 📈 Analytics & Reports

- Real-time sales dashboard
- Revenue and attendance tracking
- Export to CSV/Excel formats
- Check-in statistics
- User demographics

## 🛡️ Error Handling

- Comprehensive error middleware
- Request ID tracking
- Centralized logging
- Graceful failure handling
- User-friendly error messages

## 📞 Support

For issues and questions, please create an issue in the repository or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.