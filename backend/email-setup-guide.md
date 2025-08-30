# 📧 EventHive Email Setup Guide

## Current Issue
The email functionality is not working due to Gmail authentication problems.

## Solutions

### Solution 1: Fix Gmail Authentication (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)"
4. Enter "EventHive" as the name
5. Click "Generate"
6. Copy the 16-character password

#### Step 3: Update .env File
Replace the current password in your `.env` file:
```
EMAIL_PASS=your-new-16-character-app-password
SMTP_PASS=your-new-16-character-app-password
```

### Solution 2: Use Outlook/Hotmail (Alternative)

If Gmail continues to have issues, you can use Outlook:

#### Step 1: Update .env File
```
EMAIL_SERVICE=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-outlook-email@outlook.com
EMAIL_PASS=your-outlook-password
EMAIL_FROM=your-outlook-email@outlook.com
```

### Solution 3: Use Yahoo Mail (Alternative)

#### Step 1: Update .env File
```
EMAIL_SERVICE=yahoo
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-yahoo-email@yahoo.com
EMAIL_PASS=your-yahoo-app-password
EMAIL_FROM=your-yahoo-email@yahoo.com
```

### Solution 4: Use Professional Email Service (Production)

For production, consider using:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Amazon SES** (Very cheap)

## Testing Email Configuration

After updating your configuration, run:
```bash
node test-email.js
```

## Email Features in EventHive

The following features use email:
1. **Booking Confirmations** - Sends ticket emails when bookings are made
2. **Event Reminders** - Sends 24-hour and 1-hour reminders
3. **Ticket Resending** - Allows users to resend tickets
4. **Admin Notifications** - System notifications

## Troubleshooting

### Common Gmail Issues:
- **535-5.7.8 Username and Password not accepted**: Use App Password, not regular password
- **Less secure app access disabled**: Enable 2FA and use App Password
- **Connection timeout**: Check firewall and network settings

### Test Commands:
```bash
# Test current configuration
node test-email.js

# Test alternative configurations
node test-email-alternative.js
```

## Current Status
- ✅ Nodemailer installed correctly
- ✅ Email configuration structure is correct
- ❌ Gmail authentication failing
- ❌ Need valid App Password or alternative email service
