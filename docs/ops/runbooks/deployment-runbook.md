# ProTipp V2 – Deployment Runbook

## Áttekintés

A ProTipp V2 Deployment Runbook egy **részletes útmutató** a platform teljes deployment folyamatához, amely lefedi a **CI/CD pipeline-t**, **deployment stratégiákat**, **rollback eljárásokat** és **verifikációs lépéseket**. A runbook biztosítja a **biztonságos**, **megbízható** és **visszavonható** deployment-eket.

**Célok**:
- 🚀 **Automatizált deployment** - CI/CD pipeline teljes automatizálása
- 🔒 **Biztonságos release** - Quality gates és validációk
- ⚡ **Gyors rollback** - Azonnali visszavonás lehetősége
- 📊 **Monitoring** - Deployment metrikák és health checks

---

## 1. Deployment Architektúra

### 1.1 Environment Structure

```typescript
interface DeploymentEnvironments {
  development: {
    branch: 'develop';
    url: 'https://dev.protipp.com';
    purpose: 'Feature development and testing';
    auto_deploy: true;
    database: 'Supabase Development';
  };
  
  staging: {
    branch: 'staging';
    url: 'https://staging.protipp.com';
    purpose: 'Pre-production testing';
    auto_deploy: true;
    database: 'Supabase Staging';
  };
  
  production: {
    branch: 'main';
    url: 'https://protipp.com';
    purpose: 'Live production environment';
    auto_deploy: false;
    database: 'Supabase Production';
  };
}
```

### 1.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy ProTipp V2

on:
  push:
    branches: [develop, staging, main]
  pull_request:
    branches: [main]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Type check
        run: bun run type-check
      
      - name: Lint
        run: bun run lint
      
      - name: Format check
        run: bun run format:check
      
      - name: Unit tests
        run: bun run test
      
      - name: E2E tests
        run: bun run test:e2e
      
      - name: Security scan
        run: bun run security:scan
      
      - name: Bundle analysis
        run: bun run analyze

  deploy-staging:
    needs: quality-gates
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: |
          echo "Deploying to staging environment"
          # Netlify deployment
          # Supabase migration
          # Health checks

  deploy-production:
    needs: quality-gates
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          echo "Deploying to production environment"
          # Manual approval required
          # Netlify deployment
          # Supabase migration
          # Health checks
          # Monitoring setup
```

---

## 2. Pre-Deployment Checklist

### 2.1 Code Quality Gates

```typescript
interface QualityGates {
  code_quality: {
    typescript_compilation: 'No TypeScript errors';
    linting: 'ESLint passes with 0 errors';
    formatting: 'Biome formatting check passes';
    test_coverage: 'Minimum 80% test coverage';
  };
  
  security: {
    dependency_scan: 'No critical vulnerabilities';
    code_scan: 'Semgrep security scan passes';
    secrets_check: 'No secrets in code';
    ssl_certificates: 'Valid SSL certificates';
  };
  
  performance: {
    bundle_size: 'Bundle size within limits';
    lighthouse_score: 'Lighthouse score > 90';
    core_web_vitals: 'All Core Web Vitals pass';
    api_response_time: 'API response time < 300ms';
  };
}
```

### 2.2 Database Migration Checklist

```typescript
interface DatabaseMigrationChecklist {
  pre_migration: {
    backup_created: 'Full database backup created';
    migration_tested: 'Migration tested on staging';
    rollback_plan: 'Rollback plan documented';
    downtime_estimated: 'Downtime estimated and approved';
  };
  
  migration_validation: {
    schema_changes: 'Schema changes validated';
    data_integrity: 'Data integrity checks pass';
    performance_impact: 'Performance impact assessed';
    index_optimization: 'Indexes optimized';
  };
  
  post_migration: {
    data_validation: 'Data validation completed';
    performance_monitoring: 'Performance monitoring active';
    error_monitoring: 'Error monitoring active';
    user_acceptance: 'User acceptance testing passed';
  };
}
```

### 2.3 Environment Configuration

```typescript
interface EnvironmentConfig {
  development: {
    supabase_url: 'SUPABASE_DEV_URL';
    supabase_anon_key: 'SUPABASE_DEV_ANON_KEY';
    odds_api_key: 'ODDS_API_DEV_KEY';
    stripe_key: 'STRIPE_DEV_KEY';
    log_level: 'debug';
    debug_mode: true;
  };
  
  staging: {
    supabase_url: 'SUPABASE_STAGING_URL';
    supabase_anon_key: 'SUPABASE_STAGING_ANON_KEY';
    odds_api_key: 'ODDS_API_STAGING_KEY';
    stripe_key: 'STRIPE_STAGING_KEY';
    log_level: 'info';
    debug_mode: false;
  };
  
  production: {
    supabase_url: 'SUPABASE_PROD_URL';
    supabase_anon_key: 'SUPABASE_PROD_ANON_KEY';
    odds_api_key: 'ODDS_API_PROD_KEY';
    stripe_key: 'STRIPE_PROD_KEY';
    log_level: 'warn';
    debug_mode: false;
  };
}
```

---

## 3. Deployment Strategies

### 3.1 Blue-Green Deployment

```typescript
interface BlueGreenDeployment {
  strategy: 'Blue-Green';
  description: 'Zero-downtime deployment with instant rollback';
  
  process: {
    step_1: 'Deploy new version to green environment';
    step_2: 'Run comprehensive tests on green environment';
    step_3: 'Switch traffic from blue to green';
    step_4: 'Monitor green environment for issues';
    step_5: 'Keep blue environment as rollback option';
  };
  
  benefits: {
    zero_downtime: 'No service interruption';
    instant_rollback: 'Immediate rollback capability';
    risk_reduction: 'Lower risk of deployment failures';
    testing: 'Full testing before traffic switch';
  };
  
  implementation: {
    load_balancer: 'AWS Application Load Balancer';
    health_checks: 'Custom health check endpoints';
    traffic_switching: 'Weighted routing (0% -> 100%)';
    monitoring: 'Real-time metrics and alerts';
  };
}
```

### 3.2 Canary Deployment

```typescript
interface CanaryDeployment {
  strategy: 'Canary';
  description: 'Gradual rollout with monitoring';
  
  process: {
    step_1: 'Deploy new version to canary environment';
    step_2: 'Route 5% of traffic to canary';
    step_3: 'Monitor canary performance and errors';
    step_4: 'Gradually increase traffic (5% -> 25% -> 50% -> 100%)';
    step_5: 'Full rollout or rollback based on metrics';
  };
  
  benefits: {
    risk_mitigation: 'Limited impact of issues';
    gradual_rollout: 'Controlled deployment pace';
    real_user_testing: 'Real user feedback';
    performance_validation: 'Performance validation under load';
  };
  
  implementation: {
    traffic_splitting: 'Weighted routing in load balancer';
    monitoring: 'Canary-specific metrics and alerts';
    rollback_thresholds: 'Error rate > 1%, latency > 500ms';
    duration: '30 minutes per traffic increment';
  };
}
```

### 3.3 Rolling Deployment

```typescript
interface RollingDeployment {
  strategy: 'Rolling';
  description: 'Gradual instance replacement';
  
  process: {
    step_1: 'Start new instances with new version';
    step_2: 'Gradually replace old instances';
    step_3: 'Monitor each instance during replacement';
    step_4: 'Complete replacement of all instances';
    step_5: 'Clean up old instances';
  };
  
  benefits: {
    resource_efficiency: 'No additional resources needed';
    gradual_replacement: 'Controlled instance replacement';
    load_distribution: 'Maintains load distribution';
    cost_effective: 'Lower infrastructure costs';
  };
  
  implementation: {
    instance_replacement: 'One instance at a time';
    health_checks: 'Instance health validation';
    load_balancer: 'Automatic traffic routing';
    monitoring: 'Per-instance metrics';
  };
}
```

---

## 4. Deployment Procedures

### 4.1 Development Environment Deployment

```bash
#!/bin/bash
# deploy-dev.sh

set -e

echo "🚀 Starting Development Deployment..."

# 1. Quality Gates
echo "📋 Running Quality Gates..."
bun run type-check
bun run lint
bun run format:check
bun run test
bun run test:e2e
bun run security:scan

# 2. Build Application
echo "🔨 Building Application..."
bun run build

# 3. Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --dir=out --prod

# 4. Run Database Migrations
echo "🗄️ Running Database Migrations..."
supabase db push --project-ref $SUPABASE_DEV_PROJECT_REF

# 5. Health Checks
echo "🏥 Running Health Checks..."
curl -f https://dev.protipp.com/api/health || exit 1

# 6. Smoke Tests
echo "💨 Running Smoke Tests..."
bun run test:smoke --env=development

echo "✅ Development Deployment Complete!"
```

### 4.2 Staging Environment Deployment

```bash
#!/bin/bash
# deploy-staging.sh

set -e

echo "🚀 Starting Staging Deployment..."

# 1. Quality Gates
echo "📋 Running Quality Gates..."
bun run type-check
bun run lint
bun run format:check
bun run test
bun run test:e2e
bun run security:scan

# 2. Build Application
echo "🔨 Building Application..."
bun run build

# 3. Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --dir=out --prod

# 4. Run Database Migrations
echo "🗄️ Running Database Migrations..."
supabase db push --project-ref $SUPABASE_STAGING_PROJECT_REF

# 5. Health Checks
echo "🏥 Running Health Checks..."
curl -f https://staging.protipp.com/api/health || exit 1

# 6. Smoke Tests
echo "💨 Running Smoke Tests..."
bun run test:smoke --env=staging

# 7. Performance Tests
echo "⚡ Running Performance Tests..."
bun run test:performance --env=staging

# 8. Security Tests
echo "🔒 Running Security Tests..."
bun run test:security --env=staging

echo "✅ Staging Deployment Complete!"
```

### 4.3 Production Environment Deployment

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Starting Production Deployment..."

# 1. Pre-deployment Validation
echo "📋 Pre-deployment Validation..."
if [ "$CI" != "true" ]; then
    echo "❌ Production deployment must be run in CI environment"
    exit 1
fi

# 2. Quality Gates
echo "📋 Running Quality Gates..."
bun run type-check
bun run lint
bun run format:check
bun run test
bun run test:e2e
bun run security:scan

# 3. Build Application
echo "🔨 Building Application..."
bun run build

# 4. Create Database Backup
echo "💾 Creating Database Backup..."
supabase db dump --project-ref $SUPABASE_PROD_PROJECT_REF > backup_$(date +%Y%m%d_%H%M%S).sql

# 5. Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --dir=out --prod

# 6. Run Database Migrations
echo "🗄️ Running Database Migrations..."
supabase db push --project-ref $SUPABASE_PROD_PROJECT_REF

# 7. Health Checks
echo "🏥 Running Health Checks..."
curl -f https://protipp.com/api/health || exit 1

# 8. Smoke Tests
echo "💨 Running Smoke Tests..."
bun run test:smoke --env=production

# 9. Performance Tests
echo "⚡ Running Performance Tests..."
bun run test:performance --env=production

# 10. Security Tests
echo "🔒 Running Security Tests..."
bun run test:security --env=production

# 11. Monitoring Setup
echo "📊 Setting up Monitoring..."
bun run monitoring:setup --env=production

echo "✅ Production Deployment Complete!"
```

---

## 5. Rollback Procedures

### 5.1 Automatic Rollback Triggers

```typescript
interface RollbackTriggers {
  error_rate: {
    threshold: 'Error rate > 1%';
    duration: '5 minutes';
    action: 'Automatic rollback';
  };
  
  response_time: {
    threshold: 'P95 latency > 500ms';
    duration: '3 minutes';
    action: 'Automatic rollback';
  };
  
  availability: {
    threshold: 'Availability < 99%';
    duration: '2 minutes';
    action: 'Automatic rollback';
  };
  
  user_experience: {
    threshold: 'Core Web Vitals fail';
    duration: '5 minutes';
    action: 'Automatic rollback';
  };
}
```

### 5.2 Manual Rollback Procedure

```bash
#!/bin/bash
# rollback-production.sh

set -e

echo "🔄 Starting Production Rollback..."

# 1. Identify Previous Version
echo "🔍 Identifying Previous Version..."
PREVIOUS_VERSION=$(git log --oneline -n 2 | tail -n 1 | cut -d' ' -f1)
echo "Previous version: $PREVIOUS_VERSION"

# 2. Rollback Application
echo "🌐 Rolling back Application..."
git checkout $PREVIOUS_VERSION
bun run build
netlify deploy --dir=out --prod

# 3. Rollback Database (if needed)
echo "🗄️ Rolling back Database..."
if [ "$ROLLBACK_DB" = "true" ]; then
    supabase db reset --project-ref $SUPABASE_PROD_PROJECT_REF
    supabase db push --project-ref $SUPABASE_PROD_PROJECT_REF
fi

# 4. Health Checks
echo "🏥 Running Health Checks..."
curl -f https://protipp.com/api/health || exit 1

# 5. Smoke Tests
echo "💨 Running Smoke Tests..."
bun run test:smoke --env=production

# 6. Notify Team
echo "📢 Notifying Team..."
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Production rollback completed to version: '$PREVIOUS_VERSION'"}' \
  $SLACK_WEBHOOK_URL

echo "✅ Production Rollback Complete!"
```

### 5.3 Emergency Rollback

```bash
#!/bin/bash
# emergency-rollback.sh

set -e

echo "🚨 EMERGENCY ROLLBACK INITIATED..."

# 1. Immediate Traffic Switch
echo "🔄 Switching Traffic to Previous Version..."
# Switch load balancer to previous version
# This should be done within 30 seconds

# 2. Database Rollback
echo "🗄️ Emergency Database Rollback..."
# Restore from latest backup
# This should be done within 5 minutes

# 3. Application Rollback
echo "🌐 Emergency Application Rollback..."
# Deploy previous known good version
# This should be done within 2 minutes

# 4. Health Checks
echo "🏥 Emergency Health Checks..."
curl -f https://protipp.com/api/health || exit 1

# 5. Notify Team
echo "📢 Emergency Notification..."
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 EMERGENCY ROLLBACK COMPLETED - System restored to previous version"}' \
  $SLACK_WEBHOOK_URL

echo "✅ Emergency Rollback Complete!"
```

---

## 6. Health Checks and Monitoring

### 6.1 Health Check Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      external_apis: await checkExternalAPIs(),
      disk_space: await checkDiskSpace(),
      memory: await checkMemory(),
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
  
  return Response.json(health, { 
    status: isHealthy ? 200 : 503 
  });
}

async function checkDatabase() {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
    
    return {
      status: error ? 'unhealthy' : 'healthy',
      response_time: Date.now() - start,
      error: error?.message
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}
```

### 6.2 Monitoring Metrics

```typescript
interface MonitoringMetrics {
  application_metrics: {
    response_time: 'P50, P95, P99 response times';
    error_rate: '4xx and 5xx error rates';
    throughput: 'Requests per second';
    availability: 'Uptime percentage';
  };
  
  infrastructure_metrics: {
    cpu_usage: 'CPU utilization percentage';
    memory_usage: 'Memory utilization percentage';
    disk_usage: 'Disk space utilization';
    network_io: 'Network input/output';
  };
  
  business_metrics: {
    active_users: 'Concurrent active users';
    api_usage: 'API calls per minute';
    cache_hit_ratio: 'Cache hit percentage';
    conversion_rate: 'User conversion rate';
  };
  
  security_metrics: {
    failed_logins: 'Failed authentication attempts';
    suspicious_activity: 'Suspicious user behavior';
    api_abuse: 'API rate limit violations';
    security_events: 'Security-related events';
  };
}
```

### 6.3 Alerting Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: protipp-v2-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
      
      - alert: LowAvailability
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.instance }} is down"
      
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"
```

---

## 7. Database Migration Procedures

### 7.1 Migration Strategy

```typescript
interface MigrationStrategy {
  backward_compatible: {
    description: 'Changes that don\'t break existing functionality';
    examples: ['Adding new columns with defaults', 'Adding new indexes', 'Adding new tables'];
    rollback: 'Simple rollback by removing changes';
  };
  
  forward_compatible: {
    description: 'Changes that require application updates';
    examples: ['Removing columns', 'Changing column types', 'Adding NOT NULL constraints'];
    rollback: 'Requires application rollback first';
  };
  
  breaking_changes: {
    description: 'Changes that break existing functionality';
    examples: ['Removing tables', 'Changing primary keys', 'Major schema changes'];
    rollback: 'Complex rollback procedure required';
  };
}
```

### 7.2 Migration Script Template

```sql
-- migrations/YYYY_MM_DD_HHMMSS_description.sql

-- Migration: Add user preferences table
-- Author: Development Team
-- Date: 2025-01-11
-- Description: Add user preferences table for storing user settings

BEGIN;

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications JSONB DEFAULT '{}',
  language VARCHAR(10) DEFAULT 'hu',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### 7.3 Migration Rollback Script

```sql
-- migrations/rollback/YYYY_MM_DD_HHMMSS_description_rollback.sql

-- Rollback: Remove user preferences table
-- Author: Development Team
-- Date: 2025-01-11
-- Description: Rollback the user preferences table creation

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP INDEX IF EXISTS idx_user_preferences_theme;

-- Drop table
DROP TABLE IF EXISTS user_preferences;

COMMIT;
```

---

## 8. Testing Procedures

### 8.1 Smoke Tests

```typescript
// tests/smoke/health.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Health Checks', () => {
  test('API health endpoint', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.status).toBe('healthy');
    expect(health.checks.database.status).toBe('healthy');
    expect(health.checks.redis.status).toBe('healthy');
  });
  
  test('Homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ProTipp/);
    await expect(page.locator('h1')).toBeVisible();
  });
  
  test('Authentication flow', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('form')).toBeVisible();
  });
});
```

### 8.2 Performance Tests

```typescript
// tests/performance/api.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Performance', () => {
  test('API response time', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/odds');
    const duration = Date.now() - start;
    
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(300); // 300ms threshold
  });
  
  test('Database query performance', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/arbitrage');
    const duration = Date.now() - start;
    
    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(500); // 500ms threshold
  });
});
```

### 8.3 Security Tests

```typescript
// tests/security/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('SQL injection protection', async ({ request }) => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request.get(`/api/search?q=${encodeURIComponent(maliciousInput)}`);
    
    // Should not return 500 error (SQL injection successful)
    expect(response.status()).not.toBe(500);
  });
  
  test('XSS protection', async ({ page }) => {
    const maliciousScript = '<script>alert("XSS")</script>';
    await page.goto(`/search?q=${encodeURIComponent(maliciousScript)}`);
    
    // Should not execute the script
    await expect(page.locator('script')).not.toContainText('alert("XSS")');
  });
  
  test('Rate limiting', async ({ request }) => {
    const promises = Array(100).fill(null).map(() => 
      request.get('/api/odds')
    );
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.filter(r => r.status() === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## 9. Post-Deployment Procedures

### 9.1 Verification Checklist

```typescript
interface PostDeploymentVerification {
  functional_checks: {
    homepage_loads: 'Homepage loads without errors';
    authentication_works: 'Login/logout functionality works';
    api_endpoints_respond: 'All API endpoints respond correctly';
    database_queries_work: 'Database queries execute successfully';
    external_apis_connect: 'External API connections work';
  };
  
  performance_checks: {
    response_times: 'Response times within acceptable limits';
    page_load_speed: 'Page load speeds meet requirements';
    api_performance: 'API performance meets SLA';
    database_performance: 'Database queries perform well';
  };
  
  security_checks: {
    ssl_certificates: 'SSL certificates are valid';
    security_headers: 'Security headers are present';
    authentication: 'Authentication mechanisms work';
    authorization: 'Authorization rules are enforced';
  };
  
  monitoring_checks: {
    metrics_collection: 'Metrics are being collected';
    alerts_configured: 'Alerts are properly configured';
    dashboards_updated: 'Dashboards show current data';
    log_aggregation: 'Logs are being aggregated';
  };
}
```

### 9.2 User Acceptance Testing

```typescript
interface UserAcceptanceTesting {
  critical_user_flows: {
    user_registration: 'New user can register successfully';
    user_login: 'Existing user can login';
    odds_viewing: 'User can view odds data';
    arbitrage_detection: 'Arbitrage opportunities are detected';
    betting_flow: 'User can complete betting flow';
    profile_management: 'User can manage profile';
  };
  
  edge_cases: {
    high_traffic: 'System handles high traffic';
    network_issues: 'System handles network issues gracefully';
    invalid_inputs: 'System handles invalid inputs';
    concurrent_users: 'System handles concurrent users';
  };
  
  browser_compatibility: {
    chrome: 'Works on Chrome';
    firefox: 'Works on Firefox';
    safari: 'Works on Safari';
    edge: 'Works on Edge';
    mobile: 'Works on mobile browsers';
  };
}
```

---

## 10. Troubleshooting Guide

### 10.1 Common Deployment Issues

| Issue | Symptoms | Root Cause | Solution |
|-------|----------|------------|----------|
| **Build Failure** | CI/CD pipeline fails | TypeScript errors, missing dependencies | Fix code issues, update dependencies |
| **Deployment Timeout** | Deployment hangs | Large bundle size, slow build | Optimize bundle, increase timeout |
| **Database Migration Failure** | Migration fails | Schema conflicts, data issues | Fix migration script, restore backup |
| **Health Check Failure** | Health checks fail | Service not responding | Check service status, restart if needed |
| **Performance Degradation** | Slow response times | Resource constraints, inefficient queries | Scale resources, optimize queries |

### 10.2 Emergency Procedures

```bash
#!/bin/bash
# emergency-procedures.sh

echo "🚨 EMERGENCY PROCEDURES"

case "$1" in
  "service-down")
    echo "Service is down - initiating emergency procedures..."
    # 1. Check service status
    # 2. Restart services
    # 3. Check logs
    # 4. Notify team
    ;;
  
  "database-issues")
    echo "Database issues detected - initiating emergency procedures..."
    # 1. Check database status
    # 2. Restore from backup if needed
    # 3. Check connection pool
    # 4. Notify team
    ;;
  
  "security-breach")
    echo "Security breach detected - initiating emergency procedures..."
    # 1. Isolate affected systems
    # 2. Change passwords/keys
    # 3. Check logs for compromise
    # 4. Notify security team
    ;;
  
  *)
    echo "Usage: $0 {service-down|database-issues|security-breach}"
    exit 1
    ;;
esac
```

---

## 11. Documentation and Training

### 11.1 Team Training

```typescript
interface TeamTraining {
  deployment_training: {
    new_team_members: 'Complete deployment runbook training';
    existing_members: 'Quarterly refresher training';
    emergency_procedures: 'Emergency response training';
    rollback_procedures: 'Rollback procedure training';
  };
  
  documentation_updates: {
    runbook_updates: 'Update runbook after each deployment';
    procedure_changes: 'Document any procedure changes';
    lessons_learned: 'Document lessons learned from incidents';
    best_practices: 'Update best practices based on experience';
  };
  
  knowledge_sharing: {
    post_incident_reviews: 'Conduct post-incident reviews';
    deployment_retrospectives: 'Regular deployment retrospectives';
    cross_team_training: 'Cross-team knowledge sharing';
    external_learning: 'Attend conferences and workshops';
  };
}
```

### 11.2 Runbook Maintenance

```typescript
interface RunbookMaintenance {
  regular_updates: {
    frequency: 'Monthly review and updates';
    triggers: 'After major deployments, incidents, or changes';
    responsibility: 'DevOps team with input from all teams';
  };
  
  version_control: {
    git_repository: 'Store runbook in version control';
    change_tracking: 'Track all changes to runbook';
    approval_process: 'Require approval for runbook changes';
  };
  
  testing: {
    procedure_testing: 'Test procedures in staging environment';
    drill_exercises: 'Regular drill exercises for emergency procedures';
    feedback_collection: 'Collect feedback from team members';
  };
}
```

---

## 12. Összefoglaló

### 12.1 Kulcs Megállapítások

- **Automatizált CI/CD**: Teljes automatizálás quality gates-szel
- **Többszintű deployment**: Development → Staging → Production
- **Biztonságos rollback**: Azonnali visszavonás lehetősége
- **Átfogó monitoring**: Valós idejű metrikák és alerting

### 12.2 Deployment Stratégiák

| Stratégia | Használat | Előnyök | Hátrányok |
|-----------|-----------|---------|-----------|
| **Blue-Green** | Production | Zero downtime, instant rollback | Dupla erőforrás |
| **Canary** | Production | Risk mitigation, gradual rollout | Komplex monitoring |
| **Rolling** | Staging | Resource efficient, cost effective | Hosszabb deployment |

### 12.3 Quality Gates

1. **Code Quality**: TypeScript, linting, formatting
2. **Security**: Dependency scan, code scan, secrets check
3. **Performance**: Bundle size, Lighthouse score, Core Web Vitals
4. **Testing**: Unit tests, E2E tests, smoke tests

### 12.4 Végleges Ajánlás

**ProTipp V2 számára ajánlott deployment stratégiája**:

1. **Development**: Automatikus deployment minden commit után
2. **Staging**: Automatikus deployment + comprehensive testing
3. **Production**: Manual approval + Blue-Green deployment + Canary rollout

Ez a stratégia **biztonságos**, **megbízható** és **skálázható** deployment-eket biztosít minden környezetben.

---

**Dokumentum verzió**: 1.0  
**Utolsó frissítés**: 2025-01-11  
**Következő review**: 2025-02-11
