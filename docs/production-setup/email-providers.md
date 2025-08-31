# Email Provider Configuration for ProTipp V2

## Overview
This document outlines the email provider configuration for the notification system.

## Supported Providers

### 1. Gmail SMTP (Recommended for Development)
```env
EMAIL_PROVIDER=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=notifications@protipp.com
```

### 2. SendGrid (Recommended for Production)
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=notifications@protipp.com
```

### 3. AWS SES (Enterprise)
```env
EMAIL_PROVIDER=aws-ses
AWS_SES_ACCESS_KEY_ID=your-access-key
AWS_SES_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_REGION=us-east-1
EMAIL_FROM=notifications@protipp.com
```

### 4. Resend (Modern Alternative)
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=notifications@protipp.com
```

## Setup Instructions

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password as EMAIL_PASS

### SendGrid Setup
1. Create a SendGrid account: https://sendgrid.com
2. Generate an API key with "Mail Send" permissions
3. Verify your sender domain or use a verified sender

### AWS SES Setup
1. Create an AWS account
2. Set up SES in your preferred region
3. Verify your email address or domain
4. Create IAM credentials with SES permissions

### Resend Setup
1. Create a Resend account: https://resend.com
2. Generate an API key
3. Verify your domain or use a verified sender

## Environment Variables Template

Create a `.env.local` file with the following variables:

```env
# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=notifications@protipp.com

# Alternative: SendGrid
# EMAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key
# EMAIL_FROM=notifications@protipp.com

# Alternative: AWS SES
# EMAIL_PROVIDER=aws-ses
# AWS_SES_ACCESS_KEY_ID=your-access-key
# AWS_SES_SECRET_ACCESS_KEY=your-secret-key
# AWS_SES_REGION=us-east-1
# EMAIL_FROM=notifications@protipp.com

# Alternative: Resend
# EMAIL_PROVIDER=resend
# RESEND_API_KEY=your-resend-api-key
# EMAIL_FROM=notifications@protipp.com
```

## Testing Email Configuration

Run the following command to test your email configuration:

```bash
bun run test:email
```

This will send a test email to verify your configuration is working correctly.

## Production Considerations

1. **Domain Verification**: Verify your domain with your email provider
2. **SPF/DKIM Records**: Set up proper DNS records for better deliverability
3. **Rate Limits**: Be aware of your provider's rate limits
4. **Monitoring**: Set up email delivery monitoring
5. **Bounce Handling**: Implement bounce handling for invalid emails

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your credentials and app passwords
2. **Port Blocked**: Ensure port 587 or 465 is not blocked by your firewall
3. **Rate Limited**: Check your provider's rate limits
4. **Spam Filtered**: Ensure proper SPF/DKIM records are set up

### Debug Mode

Enable debug mode by setting:
```env
EMAIL_DEBUG=true
```

This will log detailed SMTP communication for troubleshooting.
