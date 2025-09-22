# Email Configuration Guide

## Current Issue

Microsoft/Outlook has disabled basic authentication for SMTP. The current configuration in `.env` will not work with Outlook accounts.

## Solutions

### Option 1: Use Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update .env file**:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   SKIP_EMAIL_IN_DEV=false
   ```

### Option 2: Use Development Mode (Current Setting)

The system is currently configured to skip email sending in development:

```
SKIP_EMAIL_IN_DEV=true
```

This allows the email change functionality to work without actual email delivery. The verification codes will be logged to the console instead.

### Option 3: Use Production Email Service

For production, consider using:

- **SendGrid** - Easy to set up, reliable
- **Mailgun** - Good for transactional emails
- **AWS SES** - Cost-effective for high volume
- **Postmark** - Excellent deliverability

## Testing Email Functionality

1. **Development Mode**: Set `SKIP_EMAIL_IN_DEV=true` - emails are logged to console
2. **Real Email**: Configure Gmail with app password and set `SKIP_EMAIL_IN_DEV=false`

## Current Status

The AccountSettings component will work correctly in both modes:

- ✅ Change Password
- ✅ Change Email (with development mode)
- ✅ Reset Password via Email (with development mode)

All verification codes will be displayed in the backend console when `SKIP_EMAIL_IN_DEV=true`.
