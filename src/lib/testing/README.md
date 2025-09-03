# Testing Infrastructure Documentation

## Story 1.10: Testing and Quality Assurance

Ez a dokumentáció leírja a ProTipp V2 platform testing infrastruktúráját és használatát.

## 🏗️ Testing Infrastructure

### Core Components

#### 1. TestRunner (`test-runner.ts`)
Központi tesztelési keretrendszer, amely koordinálja az összes teszt típus futtatását:

- **Unit Tests**: Vitest alapú komponens és függvény tesztek
- **Integration Tests**: API és komponens interakció tesztek  
- **Performance Tests**: k6 alapú terhelés és teljesítmény tesztek
- **Security Tests**: npm audit és kód biztonsági ellenőrzések
- **E2E Tests**: Playwright alapú végpontok közötti tesztek
- **Coverage Analysis**: Kód lefedettség mérés és elemzés

#### 2. CoverageAnalyzer (`coverage-analyzer.ts`)
Kód lefedettség elemző és jelentés generátor:

- Parses coverage reports (coverage-final.json)
- Calculates coverage percentages
- Identifies uncovered code
- Generates recommendations
- Saves coverage-report.json

#### 3. PerformanceTester (`performance-tester.ts`)
Teljesítmény tesztelő k6 scriptekkel:

- Load testing
- API performance testing
- Database performance testing
- Threshold validation
- Saves performance-report.json

#### 4. SecurityTester (`security-tester.ts`)
Biztonsági tesztelő és sebezhetőség scanner:

- Dependency vulnerability scanning (npm audit)
- Code security analysis
- Configuration security checks
- Environment variable security
- API security validation
- Saves security-report.json

### React Hooks (`use-testing.ts`)

#### useTesting()
Fő tesztelési hook, amely kezeli:
- Testing state management
- Test execution orchestration
- Progress tracking
- Error handling
- Results aggregation

#### Specialized Hooks
- `useTestResults()` - Test results data
- `useCoverageData()` - Coverage analysis data
- `usePerformanceData()` - Performance metrics
- `useSecurityData()` - Security scan results
- `useTestStatus()` - Current test status

## 🎨 UI Components

### TestDashboard (`TestDashboard.tsx`)
Fő tesztelési dashboard komponens:

- **Overview Tab**: Összefoglaló statisztikák
- **Unit Tests Tab**: Unit teszt eredmények
- **Integration Tests Tab**: Integration teszt eredmények
- **Performance Tests Tab**: Teljesítmény metrikák
- **Security Tests Tab**: Biztonsági ellenőrzések
- **Coverage Tab**: Kód lefedettség elemzés

### TestRunner (`TestRunner.tsx`)
Egyedi teszt futtató komponens:

- Test type specific configuration
- Progress tracking
- Results display
- Export functionality
- Compact and detailed views

### TestResults (`TestResults.tsx`)
Részletes teszt eredmények megjelenítése:

- Filtering and sorting
- Search functionality
- Export capabilities
- Detailed result cards
- Status indicators

## 🚀 Usage

### Basic Usage

```tsx
import { TestDashboard } from '@/components/testing';

// Full testing dashboard
<TestDashboard />

// Individual test runner
<TestRunner testType="unit" />

// Test results display
<TestResults testType="all" />
```

### Programmatic Usage

```tsx
import { useTesting } from '@/lib/hooks/use-testing';

function MyComponent() {
  const [state, actions] = useTesting();
  
  const runAllTests = () => {
    actions.runAllTests();
  };
  
  return (
    <div>
      <button onClick={runAllTests}>Run Tests</button>
      {state.isRunning && <p>Tests running... {state.progress}%</p>}
    </div>
  );
}
```

## 📊 Test Types

### Unit Tests
- **Framework**: Vitest
- **Location**: `src/**/__tests__/`
- **Command**: `npm run test:unit`
- **Coverage**: Component and function level

### Integration Tests  
- **Framework**: Vitest + Testing Library
- **Location**: `src/app/api/__tests__/`
- **Command**: `npm run test:integration`
- **Coverage**: API endpoints and component interactions

### Performance Tests
- **Framework**: k6
- **Location**: `src/lib/testing/performance-tests/`
- **Command**: `npm run test:performance`
- **Types**: Load, Stress, Spike testing

### Security Tests
- **Tools**: npm audit, custom security scanner
- **Command**: `npm run test:security`
- **Coverage**: Dependencies, code vulnerabilities, configuration

### E2E Tests
- **Framework**: Playwright
- **Command**: `npm run test:e2e`
- **Coverage**: Complete user workflows

### Coverage Analysis
- **Tool**: Vitest coverage
- **Command**: `npm run test:coverage`
- **Output**: HTML, JSON, and text reports

## 📁 File Structure

```
src/lib/testing/
├── test-runner.ts           # Central test orchestration
├── coverage-analyzer.ts     # Coverage analysis
├── performance-tester.ts    # Performance testing
├── security-tester.ts       # Security testing
├── hooks/
│   └── use-testing.ts      # React hooks
├── performance-tests/       # k6 test scripts
│   ├── api-load-test.js
│   ├── stress-test.js
│   └── spike-test.js
└── README.md               # This documentation

src/components/testing/
├── TestDashboard.tsx       # Main dashboard
├── TestRunner.tsx          # Individual runner
├── TestResults.tsx         # Results display
└── index.ts               # Exports

src/app/testing/
├── page.tsx               # Testing page
└── layout.tsx             # Page layout
```

## 🔧 Configuration

### Test Runner Configuration

```typescript
const config: TestRunnerConfig = {
  timeout: 30000,           // 30 seconds
  retries: 3,              // 3 retry attempts
  parallel: true,          // Parallel execution
  coverageThreshold: 80,   // 80% coverage required
  performanceThresholds: {
    responseTime: 500,     // 500ms max response time
    errorRate: 0.1,        // 10% max error rate
  },
  securityThresholds: {
    criticalVulnerabilities: 0,
    highVulnerabilities: 2,
    mediumVulnerabilities: 5,
  }
};
```

### Performance Test Configuration

```javascript
// k6 test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 20 },   // Sustained load
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};
```

## 📈 Metrics and Reports

### Test Results
- Test execution time
- Pass/fail status
- Error messages
- Performance metrics
- Coverage percentages

### Performance Metrics
- Response times (avg, p95, p99)
- Throughput (requests/second)
- Error rates
- Resource utilization

### Security Metrics
- Vulnerability counts by severity
- Dependency security status
- Code security issues
- Configuration security

### Coverage Metrics
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage
- Uncovered code identification

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Testing Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run coverage analysis
        run: npm run test:coverage
      
      - name: Run security tests
        run: npm run test:security
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

## 🛠️ Development

### Adding New Test Types

1. **Extend TestRunner**:
```typescript
// Add new test type to TestRunnerConfig
interface TestRunnerConfig {
  // ... existing config
  customTests?: CustomTestConfig;
}
```

2. **Create Test Implementation**:
```typescript
// Add to TestRunner class
async runCustomTests(): Promise<TestResult[]> {
  // Implementation
}
```

3. **Add UI Components**:
```tsx
// Add to TestDashboard
<TabsTrigger value="custom">Custom Tests</TabsTrigger>
```

### Adding New Performance Tests

1. **Create k6 Script**:
```javascript
// src/lib/testing/performance-tests/custom-test.js
export const options = {
  // Configuration
};

export default function () {
  // Test implementation
}
```

2. **Register in PerformanceTester**:
```typescript
// Add to performance tests array
{
  name: 'Custom Test',
  script: 'custom-test.js',
  description: 'Custom performance test'
}
```

## 📝 Best Practices

### Test Organization
- Group related tests in `__tests__` directories
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Performance Testing
- Start with load tests, then stress tests
- Use realistic test data
- Monitor system resources during tests
- Set appropriate thresholds

### Security Testing
- Run security tests regularly
- Keep dependencies updated
- Review security reports promptly
- Implement security fixes quickly

### Coverage Goals
- Aim for 80%+ overall coverage
- Focus on critical business logic
- Don't sacrifice quality for coverage
- Use coverage to identify gaps

## 🔍 Troubleshooting

### Common Issues

#### Tests Not Running
- Check if all dependencies are installed
- Verify test file naming conventions
- Check for syntax errors in test files

#### Performance Tests Failing
- Verify k6 is installed: `npm install -g k6`
- Check if target application is running
- Adjust thresholds if needed

#### Security Tests Failing
- Run `npm audit fix` to fix vulnerabilities
- Update dependencies with security issues
- Review custom security rules

#### Coverage Issues
- Ensure coverage is enabled in vitest config
- Check if files are being excluded
- Verify test files are in correct locations

### Debug Mode

Enable debug logging:

```typescript
const config: TestRunnerConfig = {
  debug: true,
  verbose: true,
  // ... other config
};
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [k6 Documentation](https://k6.io/docs/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Ez a dokumentáció a Story 1.10 Testing and Quality Assurance implementációját írja le.**
