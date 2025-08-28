# 🚀 Deployment Guide

## Overview
ProTipp V2 deployment guide for production environments with Netlify, Supabase, and external API integrations.

## 🏗️ **Architecture Overview**

### Production Stack
```
Frontend (Netlify) → CDN → Users
       ↓
Supabase (Database + Auth + Real-time)
       ↓
External APIs (The Odds API)
```

### Environment Separation
- **Development**: Local Next.js + Local/Cloud Supabase
- **Preview**: Netlify Preview Deploys + Staging Supabase
- **Production**: Netlify + Production Supabase + Live APIs

## 📋 **Pre-Deployment Checklist**

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] All linting issues fixed (`bun run lint`)
- [ ] Code formatted (`bun run format`)
- [ ] All tests passing
- [ ] No console.errors in production code
- [ ] Environment variables properly configured

### ✅ Performance
- [ ] Bundle size optimized
- [ ] Images optimized and compressed
- [ ] API rate limiting implemented
- [ ] Caching strategies in place
- [ ] Loading states implemented

### ✅ Security
- [ ] All API keys secured in environment variables
- [ ] Row Level Security (RLS) enabled in Supabase
- [ ] CORS properly configured
- [ ] No sensitive data in client bundles
- [ ] Authentication flows tested

## 🌐 **Netlify Deployment**

### Initial Setup
1. **Connect Repository**
   ```bash
   # Connect your GitHub repo to Netlify
   # Build command: bun run build
   # Publish directory: .next
   # Node version: 18.x or higher
   ```

2. **Build Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "bun run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
     NPM_FLAGS = "--prefix=/dev/null"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Environment Variables Setup**
   ```bash
   # In Netlify Dashboard → Site Settings → Environment Variables
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_ODDS_API_KEY=your-odds-api-key
   ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
   NODE_ENV=production
   ```

### Advanced Netlify Configuration

#### Preview Deployments
```toml
# netlify.toml
[context.deploy-preview]
  command = "bun run build"
  
[context.deploy-preview.environment]
  NEXT_PUBLIC_SUPABASE_URL = "https://your-staging-project.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-staging-anon-key"
```

#### Headers Configuration
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://yourdomain.com"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

#### Function Configuration (if needed)
```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[build]
  functions = "netlify/functions"
```

## 🗄️ **Supabase Production Setup**

### Database Configuration

#### 1. Create Production Project
```sql
-- Run these in Supabase SQL Editor
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

#### 2. RLS Policies
```sql
-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Bet History: Users can only see their own bets
CREATE POLICY "Users can view own bet history" ON bet_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets" ON bet_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bets" ON bet_history
  FOR UPDATE USING (auth.uid() = user_id);
```

#### 3. Database Functions
```sql
-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Authentication Setup

#### 1. OAuth Providers
```bash
# Google OAuth Setup in Supabase Dashboard
# Auth → Providers → Google
# Add your domain to authorized redirect URLs:
# https://yourdomain.com/auth/callback
```

#### 2. Email Templates
```html
<!-- Confirmation Email Template -->
<h2>Welcome to ProTipp V2!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

#### 3. Auth Settings
```json
{
  "SITE_URL": "https://yourdomain.com",
  "ADDITIONAL_REDIRECT_URLS": [
    "https://yourdomain.com/auth/callback",
    "https://deploy-preview-*--yoursite.netlify.app/auth/callback"
  ],
  "JWT_EXPIRY": 3600,
  "REFRESH_TOKEN_ROTATION_ENABLED": true,
  "SECURITY_REFRESH_TOKEN_REUSE_INTERVAL": 10
}
```

## 🔑 **Environment Variables Management**

### Production Variables
```bash
# Frontend (Netlify)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_ODDS_API_KEY=your-production-api-key
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Backend/Server (Netlify Functions if used)
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Environment-Specific Configuration
```typescript
// lib/config.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    oddsApiKey: process.env.NEXT_PUBLIC_ODDS_API_KEY!,
  },
  production: {
    apiUrl: 'https://yourdomain.com/api',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    oddsApiKey: process.env.NEXT_PUBLIC_ODDS_API_KEY!,
  },
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config];
};
```

## 🔄 **CI/CD Pipeline**

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest
    
    - name: Install dependencies
      run: bun install
    
    - name: Run linting
      run: bun run lint
    
    - name: Run type checking
      run: bunx tsc --noEmit
    
    - name: Build project
      run: bun run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        NEXT_PUBLIC_ODDS_API_KEY: ${{ secrets.NEXT_PUBLIC_ODDS_API_KEY }}
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './.next'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📊 **Performance Optimization**

### Bundle Analysis
```bash
# Add to package.json scripts
"analyze": "ANALYZE=true bun run build",
"bundle-analyzer": "bunx @next/bundle-analyzer"
```

### Image Optimization
```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['source.unsplash.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};
```

### Caching Strategy
```typescript
// lib/cache.ts
export const cacheConfig = {
  sports: 24 * 60 * 60 * 1000,      // 24 hours
  odds: 30 * 1000,                  // 30 seconds
  userProfile: 5 * 60 * 1000,       // 5 minutes
  betHistory: 60 * 1000,            // 1 minute
};
```

## 🔍 **Monitoring & Logging**

### Error Tracking Setup
```bash
# Install Sentry (optional)
bun add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
```

### Analytics Setup
```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics, Mixpanel, etc.
    gtag('event', eventName, properties);
  }
};
```

### Health Check Endpoint
```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

## 🛡️ **Security Hardening**

### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### API Rate Limiting
```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 minute
});

export function checkRateLimit(identifier: string): boolean {
  const count = (rateLimit.get(identifier) as number) || 0;
  
  if (count >= 60) { // 60 requests per minute
    return false;
  }
  
  rateLimit.set(identifier, count + 1);
  return true;
}
```

## 🧪 **Testing in Production**

### Smoke Tests
```typescript
// tests/smoke.test.ts
describe('Production Smoke Tests', () => {
  test('App loads successfully', async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_APP_URL!);
    expect(response.status).toBe(200);
  });
  
  test('API endpoints respond', async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`);
    expect(response.status).toBe(200);
  });
  
  test('Database connection works', async () => {
    // Test Supabase connection
  });
});
```

### Load Testing
```bash
# Using Artillery.io
bun add -D artillery

# artillery.yml
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Homepage load test"
    requests:
      - get:
          url: "/"
```

## 🔧 **Troubleshooting**

### Common Deployment Issues

#### 1. Build Failures
```bash
# Check Node.js version
node --version

# Clear caches
rm -rf .next node_modules
bun install
bun run build
```

#### 2. Environment Variable Issues
```typescript
// Add runtime checks
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}
```

#### 3. API Connection Problems
```typescript
// Add connection testing
const testConnections = async () => {
  try {
    // Test Supabase
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    console.log('Supabase connection:', error ? 'Failed' : 'Success');
    
    // Test Odds API
    const oddsResponse = await fetch(`${process.env.ODDS_API_BASE_URL}/sports?apiKey=${process.env.NEXT_PUBLIC_ODDS_API_KEY}`);
    console.log('Odds API connection:', oddsResponse.ok ? 'Success' : 'Failed');
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};
```

### Performance Issues
```typescript
// Monitor bundle size
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

## 📈 **Post-Deployment**

### Monitoring Checklist
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Database queries execute
- [ ] Real-time features function
- [ ] Error tracking active
- [ ] Performance metrics baseline set

### Maintenance Tasks
- [ ] Regular dependency updates
- [ ] Security patches
- [ ] Database backups verification
- [ ] SSL certificate renewal
- [ ] Performance monitoring
- [ ] Error log reviews

---

**🚀 This deployment guide ensures a robust, secure, and performant production environment for ProTipp V2.**
