# Production Environment Configuration Template

## Overview
This document provides a template for configuring the production environment for ProTipp V2.

## Environment Variables Template

Create a `.env.local` file with the following variables:

```env
# =============================================================================
# VAPID Keys for Push Notifications
# =============================================================================
# Generate these using: bun run generate-vapid
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key-here
VAPID_EMAIL=notifications@protipp.com

# =============================================================================
# Email Provider Configuration
# =============================================================================
# Choose one provider and uncomment the appropriate section

# Gmail SMTP (Development)
EMAIL_PROVIDER=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=notifications@protipp.com

# SendGrid (Production - Recommended)
# EMAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key
# EMAIL_FROM=notifications@protipp.com

# AWS SES (Enterprise)
# EMAIL_PROVIDER=aws-ses
# AWS_SES_ACCESS_KEY_ID=your-access-key
# AWS_SES_SECRET_ACCESS_KEY=your-secret-key
# AWS_SES_REGION=us-east-1
# EMAIL_FROM=notifications@protipp.com

# Resend (Modern Alternative)
# EMAIL_PROVIDER=resend
# RESEND_API_KEY=your-resend-api-key
# EMAIL_FROM=notifications@protipp.com

# =============================================================================
# SMS Provider Configuration
# =============================================================================
# Choose one provider and uncomment the appropriate section

# Twilio (Production - Recommended)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Vonage (Nexmo)
# SMS_PROVIDER=vonage
# VONAGE_API_KEY=your-api-key
# VONAGE_API_SECRET=your-api-secret
# VONAGE_PHONE_NUMBER=+1234567890

# AWS SNS (Enterprise)
# SMS_PROVIDER=aws-sns
# AWS_SNS_ACCESS_KEY_ID=your-access-key
# AWS_SNS_SECRET_ACCESS_KEY=your-secret-key
# AWS_SNS_REGION=us-east-1
# AWS_SNS_PHONE_NUMBER=+1234567890

# MessageBird (European Focus)
# SMS_PROVIDER=messagebird
# MESSAGEBIRD_API_KEY=your-api-key
# MESSAGEBIRD_PHONE_NUMBER=+1234567890

# =============================================================================
# Supabase Configuration
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# =============================================================================
# Testing Configuration
# =============================================================================
# Test email and phone for configuration testing
TEST_EMAIL=test@example.com
TEST_PHONE=+1234567890

# =============================================================================
# Debug Configuration
# =============================================================================
# Enable debug mode for troubleshooting
EMAIL_DEBUG=false
SMS_DEBUG=false

# =============================================================================
# Application Configuration
# =============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# =============================================================================
# Security Configuration
# =============================================================================
# Generate a secure random string for session encryption
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com
```

## Setup Instructions

### 1. Generate VAPID Keys
```bash
bun run generate-vapid
```

### 2. Configure Email Provider
Choose one email provider and follow the setup instructions in `docs/production-setup/email-providers.md`

### 3. Configure SMS Provider
Choose one SMS provider and follow the setup instructions in `docs/production-setup/sms-providers.md`

### 4. Test Configuration
```bash
# Test email configuration
bun run test:email

# Test SMS configuration
bun run test:sms
```

## Security Best Practices

1. **Never commit .env.local to version control**
2. **Use strong, unique passwords and API keys**
3. **Rotate credentials regularly**
4. **Use environment-specific configurations**
5. **Monitor for unauthorized access**

## Troubleshooting

### Common Issues

1. **VAPID Keys Not Working**: Ensure keys are properly generated and configured
2. **Email Not Sending**: Check provider credentials and network connectivity
3. **SMS Not Sending**: Verify phone number verification and account balance
4. **Environment Variables Not Loading**: Ensure .env.local is in the project root

### Debug Mode

Enable debug mode for troubleshooting:
```env
EMAIL_DEBUG=true
SMS_DEBUG=true
```

## Production Checklist

- [ ] VAPID keys generated and configured
- [ ] Email provider configured and tested
- [ ] SMS provider configured and tested
- [ ] Supabase credentials configured
- [ ] Environment variables set in production
- [ ] SSL certificates configured
- [ ] Domain verification completed
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Backup and recovery procedures in place
