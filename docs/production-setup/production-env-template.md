# Production Environment Configuration Template

## Overview
This document provides the complete production environment configuration for ProTipp V2 deployment.

## Environment Variables for Production

Create these environment variables in your deployment platform (Netlify, Vercel, etc.):

### Application Configuration
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=ProTipp V2
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Supabase Configuration (REQUIRED)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

### Authentication Configuration
```env
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com
```

### API Configuration
```env
NEXT_PUBLIC_ODDS_API_KEY=your-odds-api-key-here
NEXT_PUBLIC_ODDS_API_URL=https://api.odds-api.com/v4
```

### Push Notifications (Optional)
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key-here
VAPID_EMAIL=notifications@your-domain.com
```

### Email Configuration (Optional)
```env
# SendGrid (Recommended)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=notifications@your-domain.com

# Alternative: Gmail SMTP
# EMAIL_PROVIDER=gmail
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

### SMS Configuration (Optional)
```env
# Twilio (Recommended)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Monitoring & Analytics (Optional)
```env
NEXT_PUBLIC_GA_ID=your-google-analytics-id
SENTRY_DSN=your-sentry-dsn
HOTJAR_ID=your-hotjar-id
```

### Performance & Caching (Optional)
```env
REDIS_URL=your-redis-url
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
```

### Security Configuration
```env
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Feature Flags
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

### Debug Configuration
```env
EMAIL_DEBUG=false
SMS_DEBUG=false
API_DEBUG=false
```

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project for production
2. Copy the project URL and anon key
3. Generate a service role key for server-side operations
4. Set up Row Level Security policies

### 2. Domain Configuration
1. Purchase and configure your domain
2. Set up SSL certificates
3. Configure DNS records
4. Update CORS origins

### 3. API Keys Setup
1. Register for Odds API service
2. Generate API keys for external services
3. Configure rate limiting

### 4. Monitoring Setup
1. Set up Google Analytics
2. Configure Sentry for error tracking
3. Set up performance monitoring

## Security Checklist

- [ ] All API keys are secure and rotated regularly
- [ ] CORS origins are properly configured
- [ ] Rate limiting is enabled
- [ ] SSL certificates are valid
- [ ] Environment variables are not exposed in client code
- [ ] Database has proper RLS policies
- [ ] Authentication is properly configured

## Performance Checklist

- [ ] CDN is configured for static assets
- [ ] Image optimization is enabled
- [ ] Bundle size is optimized
- [ ] Caching strategies are implemented
- [ ] Database queries are optimized
- [ ] Monitoring is set up

## Deployment Platforms

### Netlify
1. Connect your GitHub repository
2. Set build command: `bun run build`
3. Set publish directory: `.next`
4. Add environment variables in dashboard
5. Configure custom domain

### Vercel
1. Import your GitHub repository
2. Set framework preset to Next.js
3. Add environment variables
4. Configure custom domain
5. Enable automatic deployments

### Docker
1. Use the provided Dockerfile
2. Set environment variables in docker-compose.yml
3. Configure reverse proxy
4. Set up SSL termination

## Troubleshooting

### Common Issues

1. **Build Failures**: Check environment variables and dependencies
2. **Database Connection**: Verify Supabase credentials
3. **CORS Errors**: Check domain configuration
4. **Performance Issues**: Monitor bundle size and API response times

### Debug Mode

Enable debug mode for troubleshooting:
```env
EMAIL_DEBUG=true
SMS_DEBUG=true
API_DEBUG=true
```

## Support

For additional help:
- Check the main documentation
- Review error logs
- Contact support team
- Check deployment platform documentation
