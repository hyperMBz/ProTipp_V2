# Production Setup Guide - ProTipp V2 Notification System

## Overview
This guide provides step-by-step instructions for setting up the ProTipp V2 notification system in production.

## Quick Start

### 1. Generate VAPID Keys
```bash
bun run generate-vapid
```

### 2. Configure Environment Variables
Copy the template and fill in your values:
```bash
cp docs/production-setup/env-template.md .env.local
```

### 3. Set Up Email Provider
Choose and configure your email provider:
- [Gmail SMTP](email-providers.md#gmail-setup) (Development)
- [SendGrid](email-providers.md#sendgrid-setup) (Production - Recommended)
- [AWS SES](email-providers.md#aws-ses-setup) (Enterprise)
- [Resend](email-providers.md#resend-setup) (Modern Alternative)

### 4. Set Up SMS Provider
Choose and configure your SMS provider:
- [Twilio](sms-providers.md#twilio-setup) (Production - Recommended)
- [Vonage](sms-providers.md#vonage-setup) (Alternative)
- [AWS SNS](sms-providers.md#aws-sns-setup) (Enterprise)
- [MessageBird](sms-providers.md#messagebird-setup) (European Focus)

### 5. Test Configuration
```bash
# Test email configuration
bun run test:email

# Test SMS configuration
bun run test:sms
```

## Detailed Setup Instructions

### Email Provider Setup
See [email-providers.md](email-providers.md) for detailed setup instructions for each supported provider.

### SMS Provider Setup
See [sms-providers.md](sms-providers.md) for detailed setup instructions for each supported provider.

### Environment Configuration
See [env-template.md](env-template.md) for complete environment variable documentation.

## Production Checklist

### Pre-Deployment
- [ ] VAPID keys generated and configured
- [ ] Email provider configured and tested
- [ ] SMS provider configured and tested
- [ ] Supabase credentials configured
- [ ] Environment variables set in production
- [ ] SSL certificates configured
- [ ] Domain verification completed

### Post-Deployment
- [ ] Push notification permissions working
- [ ] Email delivery confirmed
- [ ] SMS delivery confirmed
- [ ] Notification history tracking working
- [ ] Alert thresholds functioning correctly
- [ ] Integration with existing alert system verified

### Monitoring & Maintenance
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Backup and recovery procedures in place
- [ ] Cost monitoring for SMS/email usage
- [ ] Performance monitoring configured

## Troubleshooting

### Common Issues

#### Push Notifications Not Working
1. Check VAPID key configuration
2. Verify domain is HTTPS
3. Check browser notification permissions
4. Review service worker registration

#### Email Not Sending
1. Verify provider credentials
2. Check network connectivity
3. Review provider rate limits
4. Check email templates

#### SMS Not Sending
1. Verify provider credentials
2. Check phone number verification
3. Review account balance
4. Check geographic restrictions

### Debug Mode
Enable debug mode for troubleshooting:
```env
EMAIL_DEBUG=true
SMS_DEBUG=true
```

### Support Resources
- [Email Provider Documentation](email-providers.md)
- [SMS Provider Documentation](sms-providers.md)
- [Environment Configuration](env-template.md)
- [Story 1.6 Implementation](../stories/1.6.story.md)

## Security Considerations

### Best Practices
1. **Never commit .env.local to version control**
2. **Use strong, unique passwords and API keys**
3. **Rotate credentials regularly**
4. **Use environment-specific configurations**
5. **Monitor for unauthorized access**

### Data Protection
1. **Secure notification data handling**
2. **User consent for notifications**
3. **Privacy-compliant data storage**
4. **Encrypted communication channels**

## Cost Management

### Email Costs
- **Gmail**: Free (with limits)
- **SendGrid**: $14.95/month for 50k emails
- **AWS SES**: $0.10 per 1,000 emails
- **Resend**: $20/month for 50k emails

### SMS Costs
- **Twilio**: $0.0079 per SMS (US)
- **Vonage**: $0.00645 per SMS (US)
- **AWS SNS**: $0.00645 per SMS (US)
- **MessageBird**: €0.05 per SMS (EU)

### Optimization Tips
1. **Implement rate limiting**
2. **Use notification preferences**
3. **Batch notifications when possible**
4. **Monitor usage patterns**

## Performance Optimization

### Notification Delivery
1. **Use efficient filtering**
2. **Implement queuing for high volume**
3. **Optimize notification templates**
4. **Monitor delivery rates**

### System Performance
1. **Efficient database queries**
2. **Caching strategies**
3. **Background processing**
4. **Load balancing**

## Maintenance

### Regular Tasks
1. **Monitor notification delivery rates**
2. **Review and update templates**
3. **Check provider status**
4. **Update security credentials**
5. **Review cost usage**

### Updates
1. **Keep dependencies updated**
2. **Monitor for security patches**
3. **Test new features**
4. **Backup configurations**

## Emergency Procedures

### Provider Outages
1. **Monitor provider status pages**
2. **Implement fallback providers**
3. **Notify users of issues**
4. **Switch to alternative channels**

### Security Incidents
1. **Immediately rotate credentials**
2. **Review access logs**
3. **Notify affected users**
4. **Implement additional security measures**

## Support Contacts

### Email Providers
- **Gmail**: https://support.google.com
- **SendGrid**: https://support.sendgrid.com
- **AWS SES**: https://aws.amazon.com/support
- **Resend**: https://resend.com/support

### SMS Providers
- **Twilio**: https://support.twilio.com
- **Vonage**: https://help.nexmo.com
- **AWS SNS**: https://aws.amazon.com/support
- **MessageBird**: https://support.messagebird.com

---

**For technical support or questions about this setup guide, please refer to the Story 1.6 implementation documentation or contact the development team.**
