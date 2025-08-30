# EventMitra - Your AI-Powered Event Companion

EventMitra is a comprehensive event management platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a seamless experience for event discovery, booking, management, and attendance tracking.

## 🌟 Features

### For Event Attendees
- **Event Discovery**: Browse and search events by category, location, date, and price
- **Secure Booking**: Book tickets with integrated Razorpay payment gateway
- **Digital Tickets**: QR code-based tickets delivered via email/WhatsApp
- **Event Reminders**: 24-hour and 1-hour automated reminders
- **Loyalty Points**: Earn points for attending events
- **Reviews & Ratings**: Rate and review attended events
- **Profile Management**: Complete user profile with preferences

### For Event Organizers
- **Event Creation**: Create and manage events with rich details
- **Ticket Management**: Multiple ticket types with pricing and availability
- **Analytics Dashboard**: Real-time sales, revenue, and attendance analytics
- **Check-in System**: QR code scanning for event entry
- **Attendee Management**: Export attendee lists and contact information
- **Promotional Tools**: Coupons, early bird pricing, and group discounts

### For Administrators
- **Platform Management**: Oversee all events, users, and transactions
- **Analytics & Reports**: Comprehensive platform analytics and data exports
- **User Management**: Manage user roles and verification status
- **Content Moderation**: Review and approve events and content
- **Coupon Management**: Create and manage platform-wide coupons

## 🏗 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt.js** for password hashing
- **Razorpay** for payment processing
- **Nodemailer** for email notifications
- **Twilio** for SMS/WhatsApp notifications
- **Cloudinary** for image storage
- **QRCode** for ticket generation

### Frontend
- **React.js** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router** for navigation
- **TailwindCSS** for styling
- **React Hot Toast** for notifications
- **Axios** for API calls
- **React Hook Form** for form handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd eventmitra
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Environment Setup**
Create a `.env` file in the server directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/eventmitra

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server Port
PORT=5000
NODE_ENV=development
```

5. **Start the development servers**

Backend server:
```bash
cd server
npm run dev
```

Frontend server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📂 Project Structure

```
eventmitra/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # CSS styles
│   ├── package.json
│   └── tailwind.config.js
└── server/                 # Node.js backend
    ├── controllers/        # Route controllers
    ├── middleware/         # Custom middleware
    ├── models/             # MongoDB models
    ├── routes/             # API routes
    ├── utils/              # Utility functions
    ├── config/             # Configuration files
    ├── .env                # Environment variables
    ├── package.json
    └── server.js           # Main server file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Organizer)
- `PUT /api/events/:id` - Update event (Organizer)
- `DELETE /api/events/:id` - Delete event (Organizer)
- `GET /api/events/organizer/my-events` - Get organizer events

### Tickets
- `GET /api/tickets` - Get user tickets
- `GET /api/tickets/:ticketId` - Get ticket details
- `POST /api/tickets/verify` - Verify ticket QR
- `POST /api/tickets/checkin` - Check-in ticket
- `GET /api/tickets/:ticketId/pdf` - Download ticket PDF

### Payments
- `POST /api/payments/create-order` - Create order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/orders` - Get user orders
- `POST /api/payments/apply-coupon` - Apply coupon
- `POST /api/payments/refund/:orderId` - Process refund

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId` - Update user
- `GET /api/admin/events` - Get all events
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/analytics` - Platform analytics

## 🧪 Testing

Run tests for the backend:
```bash
cd server
npm test
```

Run tests for the frontend:
```bash
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Create a new app on your platform
2. Set environment variables
3. Deploy using Git or CLI

### Frontend Deployment (Vercel/Netlify)
1. Build the production bundle:
```bash
cd client
npm run build
```
2. Deploy the `build` folder to your hosting platform

### Database
- Use MongoDB Atlas for production database
- Update MONGODB_URI in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@eventmitra.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- Built for hackathon submission
- Inspired by modern event management platforms
- Thanks to all contributors and testers

## 🔮 Future Enhancements

- **AI Recommendations**: ML-based event recommendations
- **Social Features**: Friend connections and group bookings
- **Live Streaming**: Hybrid event support
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Predictive analytics for organizers
- **Multi-language**: Support for multiple languages
- **Calendar Integration**: Sync with Google/Outlook calendars
