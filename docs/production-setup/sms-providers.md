# SMS Provider Configuration for ProTipp V2

## Overview
This document outlines the SMS provider configuration for the notification system.

## Supported Providers

### 1. Twilio (Recommended for Production)
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Vonage (Nexmo) (Alternative)
```env
SMS_PROVIDER=vonage
VONAGE_API_KEY=your-api-key
VONAGE_API_SECRET=your-api-secret
VONAGE_PHONE_NUMBER=+1234567890
```

### 3. AWS SNS (Enterprise)
```env
SMS_PROVIDER=aws-sns
AWS_SNS_ACCESS_KEY_ID=your-access-key
AWS_SNS_SECRET_ACCESS_KEY=your-secret-key
AWS_SNS_REGION=us-east-1
AWS_SNS_PHONE_NUMBER=+1234567890
```

### 4. MessageBird (European Focus)
```env
SMS_PROVIDER=messagebird
MESSAGEBIRD_API_KEY=your-api-key
MESSAGEBIRD_PHONE_NUMBER=+1234567890
```

## Setup Instructions

### Twilio Setup
1. Create a Twilio account: https://twilio.com
2. Get your Account SID and Auth Token from the console
3. Purchase a phone number for SMS sending
4. Note: Twilio requires phone number verification for trial accounts

### Vonage Setup
1. Create a Vonage account: https://vonage.com
2. Get your API Key and Secret from the dashboard
3. Purchase a phone number for SMS sending

### AWS SNS Setup
1. Create an AWS account
2. Set up SNS in your preferred region
3. Create IAM credentials with SNS permissions
4. Purchase a phone number through AWS SNS

### MessageBird Setup
1. Create a MessageBird account: https://messagebird.com
2. Get your API key from the dashboard
3. Purchase a phone number for SMS sending

## Environment Variables Template

Create a `.env.local` file with the following variables:

```env
# SMS Configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Alternative: Vonage
# SMS_PROVIDER=vonage
# VONAGE_API_KEY=your-api-key
# VONAGE_API_SECRET=your-api-secret
# VONAGE_PHONE_NUMBER=+1234567890

# Alternative: AWS SNS
# SMS_PROVIDER=aws-sns
# AWS_SNS_ACCESS_KEY_ID=your-access-key
# AWS_SNS_SECRET_ACCESS_KEY=your-secret-key
# AWS_SNS_REGION=us-east-1
# AWS_SNS_PHONE_NUMBER=+1234567890

# Alternative: MessageBird
# SMS_PROVIDER=messagebird
# MESSAGEBIRD_API_KEY=your-api-key
# MESSAGEBIRD_PHONE_NUMBER=+1234567890
```

## Testing SMS Configuration

Run the following command to test your SMS configuration:

```bash
bun run test:sms
```

This will send a test SMS to verify your configuration is working correctly.

## Production Considerations

1. **Phone Number Verification**: Verify your sender phone number with your provider
2. **Rate Limits**: Be aware of your provider's rate limits and costs
3. **Geographic Restrictions**: Some providers have geographic restrictions
4. **Compliance**: Ensure compliance with local SMS regulations
5. **Cost Management**: Monitor SMS costs and implement rate limiting

## Cost Considerations

### Twilio Pricing (US)
- $0.0079 per SMS (US numbers)
- $0.079 per SMS (International)
- Monthly phone number rental: ~$1/month

### Vonage Pricing
- $0.00645 per SMS (US numbers)
- Varies by country for international
- Monthly phone number rental: ~$1/month

### AWS SNS Pricing
- $0.00645 per SMS (US numbers)
- Varies by country for international
- No monthly phone number fees

### MessageBird Pricing
- €0.05 per SMS (European numbers)
- Varies by country for international
- Monthly phone number rental: ~€1/month

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your API credentials
2. **Phone Number Not Verified**: Verify your sender phone number
3. **Rate Limited**: Check your provider's rate limits
4. **Geographic Restrictions**: Ensure your phone number supports the target region
5. **Insufficient Credits**: Check your account balance

### Debug Mode

Enable debug mode by setting:
```env
SMS_DEBUG=true
```

This will log detailed API communication for troubleshooting.

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Access Control**: Use the minimum required permissions for API keys
3. **Monitoring**: Set up alerts for unusual SMS activity
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Phone Number Validation**: Validate phone numbers before sending SMS

## Integration with Notification System

The SMS provider is automatically integrated with the notification system. Users can:

1. Enable/disable SMS notifications in their settings
2. Set phone number preferences
3. Choose notification types for SMS delivery
4. View SMS delivery status in notification history

## Emergency Contacts

For production issues:

- **Twilio**: https://support.twilio.com
- **Vonage**: https://help.nexmo.com
- **AWS SNS**: https://aws.amazon.com/support
- **MessageBird**: https://support.messagebird.com
