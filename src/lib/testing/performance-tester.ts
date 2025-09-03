/**
 * Performance Tester for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * Comprehensive performance testing and validation
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface PerformanceMetrics {
  avg_response_time: number;
  max_response_time: number;
  min_response_time: number;
  requests_per_second: number;
  total_requests: number;
  failed_requests: number;
  success_rate: number;
  p95_response_time: number;
  p99_response_time: number;
}

export interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  concurrent_users: number;
  duration_seconds: number;
  threshold_ms: number;
  metrics: PerformanceMetrics;
  status: 'pass' | 'fail' | 'warning';
  timestamp: Date;
}

export interface PerformanceReport {
  summary: {
    total_tests: number;
    passed: number;
    failed: number;
    warning: number;
    avg_response_time: number;
    max_concurrent_users: number;
  };
  tests: PerformanceTest[];
  recommendations: string[];
  status: 'pass' | 'fail' | 'warning';
}

export class PerformanceTester {
  private baseUrl: string;
  private defaultThreshold: number;

  constructor(baseUrl: string = 'http://localhost:3000', defaultThreshold: number = 100) {
    this.baseUrl = baseUrl;
    this.defaultThreshold = defaultThreshold;
  }

  /**
   * Run comprehensive performance tests
   */
  async runPerformanceTests(): Promise<PerformanceReport> {
    console.log('⚡ Starting performance tests...');

    const tests: PerformanceTest[] = [];

    // Test 1: Light load test
    tests.push(await this.runLoadTest({
      name: 'Light Load Test',
      description: 'Test with 10 concurrent users for 30 seconds',
      concurrent_users: 10,
      duration_seconds: 30,
      threshold_ms: this.defaultThreshold
    }));

    // Test 2: Medium load test
    tests.push(await this.runLoadTest({
      name: 'Medium Load Test',
      description: 'Test with 50 concurrent users for 60 seconds',
      concurrent_users: 50,
      duration_seconds: 60,
      threshold_ms: this.defaultThreshold
    }));

    // Test 3: High load test
    tests.push(await this.runLoadTest({
      name: 'High Load Test',
      description: 'Test with 100 concurrent users for 120 seconds',
      concurrent_users: 100,
      duration_seconds: 120,
      threshold_ms: this.defaultThreshold
    }));

    // Test 4: API endpoint test
    tests.push(await this.runAPITest({
      name: 'API Endpoint Test',
      description: 'Test API endpoints performance',
      concurrent_users: 25,
      duration_seconds: 45,
      threshold_ms: 50
    }));

    // Test 5: Database query test
    tests.push(await this.runDatabaseTest({
      name: 'Database Query Test',
      description: 'Test database query performance',
      concurrent_users: 20,
      duration_seconds: 30,
      threshold_ms: 200
    }));

    const summary = this.generateSummary(tests);
    const recommendations = this.generateRecommendations(tests);
    const status = this.determineOverallStatus(tests);

    const report: PerformanceReport = {
      summary,
      tests,
      recommendations,
      status
    };

    this.saveReport(report);
    return report;
  }

  /**
   * Run load test using k6
   */
  private async runLoadTest(config: {
    name: string;
    description: string;
    concurrent_users: number;
    duration_seconds: number;
    threshold_ms: number;
  }): Promise<PerformanceTest> {
    console.log(`🔄 Running ${config.name}...`);

    const k6Script = this.generateLoadTestScript(config);
    const scriptPath = join(process.cwd(), `k6-${config.name.toLowerCase().replace(/\s+/g, '-')}.js`);
    writeFileSync(scriptPath, k6Script);

    try {
      const result = execSync(`k6 run --out json=k6-results-${config.name.toLowerCase().replace(/\s+/g, '-')}.json ${scriptPath}`, {
        encoding: 'utf8',
        timeout: (config.duration_seconds + 30) * 1000
      });

      const metrics = this.parseK6Results(`k6-results-${config.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      const status = this.determineTestStatus(metrics, config.threshold_ms);

      return {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: config.name,
        description: config.description,
        concurrent_users: config.concurrent_users,
        duration_seconds: config.duration_seconds,
        threshold_ms: config.threshold_ms,
        metrics,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error);
      return {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: config.name,
        description: config.description,
        concurrent_users: config.concurrent_users,
        duration_seconds: config.duration_seconds,
        threshold_ms: config.threshold_ms,
        metrics: this.getEmptyMetrics(),
        status: 'fail',
        timestamp: new Date()
      };
    }
  }

  /**
   * Run API endpoint test
   */
  private async runAPITest(config: {
    name: string;
    description: string;
    concurrent_users: number;
    duration_seconds: number;
    threshold_ms: number;
  }): Promise<PerformanceTest> {
    console.log(`🔗 Running ${config.name}...`);

    const k6Script = this.generateAPITestScript(config);
    const scriptPath = join(process.cwd(), `k6-${config.name.toLowerCase().replace(/\s+/g, '-')}.js`);
    writeFileSync(scriptPath, k6Script);

    try {
      const result = execSync(`k6 run --out json=k6-results-${config.name.toLowerCase().replace(/\s+/g, '-')}.json ${scriptPath}`, {
        encoding: 'utf8',
        timeout: (config.duration_seconds + 30) * 1000
      });

      const metrics = this.parseK6Results(`k6-results-${config.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      const status = this.determineTestStatus(metrics, config.threshold_ms);

      return {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: config.name,
        description: config.description,
        concurrent_users: config.concurrent_users,
        duration_seconds: config.duration_seconds,
        threshold_ms: config.threshold_ms,
        metrics,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error);
      return {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: config.name,
        description: config.description,
        concurrent_users: config.concurrent_users,
        duration_seconds: config.duration_seconds,
        threshold_ms: config.threshold_ms,
        metrics: this.getEmptyMetrics(),
        status: 'fail',
        timestamp: new Date()
      };
    }
  }

  /**
   * Run database query test
   */
  private async runDatabaseTest(config: {
    name: string;
    description: string;
    concurrent_users: number;
    duration_seconds: number;
    threshold_ms: number;
  }): Promise<PerformanceTest> {
    console.log(`🗄️ Running ${config.name}...`);

    const k6Script = this.generateDatabaseTestScript(config);
    const scriptPath = join(process.cwd(), `k6-${config.name.toLowerCase().replace(/\s+/g, '-')}.js`);
    writeFileSync(scriptPath, k6Script);

    try {
      const result = execSync(`k6 run --out json=k6-results-${config.name.toLowerCase().replace(/\s+/g, '-')}.json ${scriptPath}`, {
        encoding: 'utf8',
        timeout: (config.duration_seconds + 30) * 1000
      });

      const metrics = this.parseK6Results(`k6-results-${config.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      const status = this.determineTestStatus(metrics, config.threshold_ms);

      return {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: config.name,
        description: config.description,
        concurrent_users: config.concurrent_users,
        duration_seconds: config.duration_seconds,
        threshold_ms: config.threshold_ms,
        metrics,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error);
      return {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: config.name,
        description: config.description,
        concurrent_users: config.concurrent_users,
        duration_seconds: config.duration_seconds,
        threshold_ms: config.threshold_ms,
        metrics: this.getEmptyMetrics(),
        status: 'fail',
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate k6 load test script
   */
  private generateLoadTestScript(config: {
    concurrent_users: number;
    duration_seconds: number;
    threshold_ms: number;
  }): string {
    return `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: ${config.concurrent_users} },
    { duration: '${config.duration_seconds}s', target: ${config.concurrent_users} },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<${config.threshold_ms}', 'p(99)<${config.threshold_ms * 2}'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>${config.concurrent_users * 0.8}'],
  },
};

export default function () {
  const baseUrl = '${this.baseUrl}';
  
  // Test main page
  const mainPageRes = http.get(baseUrl);
  check(mainPageRes, {
    'main page status is 200': (r) => r.status === 200,
    'main page loads fast': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  // Test dashboard page
  const dashboardRes = http.get(baseUrl + '/dashboard');
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard loads fast': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  // Test arbitrage page
  const arbitrageRes = http.get(baseUrl + '/arbitrage');
  check(arbitrageRes, {
    'arbitrage page status is 200': (r) => r.status === 200,
    'arbitrage page loads fast': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  sleep(1);
}
`;
  }

  /**
   * Generate k6 API test script
   */
  private generateAPITestScript(config: {
    concurrent_users: number;
    duration_seconds: number;
    threshold_ms: number;
  }): string {
    return `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: ${config.concurrent_users} },
    { duration: '${config.duration_seconds}s', target: ${config.concurrent_users} },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<${config.threshold_ms}', 'p(99)<${config.threshold_ms * 2}'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = '${this.baseUrl}';
  
  // Test odds API
  const oddsRes = http.get(baseUrl + '/api/v1/odds');
  check(oddsRes, {
    'odds API status is 200': (r) => r.status === 200,
    'odds API response time < ${config.threshold_ms}ms': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  // Test arbitrage API
  const arbitrageRes = http.get(baseUrl + '/api/v1/arbitrage');
  check(arbitrageRes, {
    'arbitrage API status is 200': (r) => r.status === 200,
    'arbitrage API response time < ${config.threshold_ms}ms': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  // Test bookmakers API
  const bookmakersRes = http.get(baseUrl + '/api/v1/bookmakers');
  check(bookmakersRes, {
    'bookmakers API status is 200': (r) => r.status === 200,
    'bookmakers API response time < ${config.threshold_ms}ms': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  sleep(0.5);
}
`;
  }

  /**
   * Generate k6 database test script
   */
  private generateDatabaseTestScript(config: {
    concurrent_users: number;
    duration_seconds: number;
    threshold_ms: number;
  }): string {
    return `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: ${config.concurrent_users} },
    { duration: '${config.duration_seconds}s', target: ${config.concurrent_users} },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<${config.threshold_ms}', 'p(99)<${config.threshold_ms * 2}'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = '${this.baseUrl}';
  
  // Test database-heavy operations
  const userDataRes = http.get(baseUrl + '/api/v1/user/data');
  check(userDataRes, {
    'user data API status is 200': (r) => r.status === 200,
    'user data API response time < ${config.threshold_ms}ms': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  // Test analytics API
  const analyticsRes = http.get(baseUrl + '/api/v1/analytics');
  check(analyticsRes, {
    'analytics API status is 200': (r) => r.status === 200,
    'analytics API response time < ${config.threshold_ms}ms': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  // Test performance API
  const performanceRes = http.get(baseUrl + '/api/v1/performance');
  check(performanceRes, {
    'performance API status is 200': (r) => r.status === 200,
    'performance API response time < ${config.threshold_ms}ms': (r) => r.timings.duration < ${config.threshold_ms},
  });
  
  sleep(1);
}
`;
  }

  /**
   * Parse k6 results from JSON file
   */
  private parseK6Results(resultsPath: string): PerformanceMetrics {
    try {
      if (existsSync(resultsPath)) {
        const data = JSON.parse(readFileSync(resultsPath, 'utf8'));
        const metrics = data.metrics || {};
        
        return {
          avg_response_time: metrics.http_req_duration?.avg || 0,
          max_response_time: metrics.http_req_duration?.max || 0,
          min_response_time: metrics.http_req_duration?.min || 0,
          requests_per_second: metrics.http_reqs?.rate || 0,
          total_requests: metrics.http_reqs?.count || 0,
          failed_requests: metrics.http_req_failed?.rate || 0,
          success_rate: metrics.http_req_failed?.rate ? (1 - metrics.http_req_failed.rate) * 100 : 100,
          p95_response_time: metrics.http_req_duration?.['p(95)'] || 0,
          p99_response_time: metrics.http_req_duration?.['p(99)'] || 0
        };
      }
    } catch (error) {
      console.warn('Could not parse k6 results:', error);
    }
    return this.getEmptyMetrics();
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      avg_response_time: 0,
      max_response_time: 0,
      min_response_time: 0,
      requests_per_second: 0,
      total_requests: 0,
      failed_requests: 0,
      success_rate: 0,
      p95_response_time: 0,
      p99_response_time: 0
    };
  }

  /**
   * Determine test status based on metrics and threshold
   */
  private determineTestStatus(metrics: PerformanceMetrics, threshold: number): 'pass' | 'fail' | 'warning' {
    if (metrics.avg_response_time <= threshold && metrics.success_rate >= 99) {
      return 'pass';
    } else if (metrics.avg_response_time <= threshold * 1.5 && metrics.success_rate >= 95) {
      return 'warning';
    } else {
      return 'fail';
    }
  }

  /**
   * Generate performance test summary
   */
  private generateSummary(tests: PerformanceTest[]) {
    const totalTests = tests.length;
    const passed = tests.filter(t => t.status === 'pass').length;
    const failed = tests.filter(t => t.status === 'fail').length;
    const warning = tests.filter(t => t.status === 'warning').length;
    
    const avgResponseTime = tests.reduce((sum, test) => sum + test.metrics.avg_response_time, 0) / totalTests;
    const maxConcurrentUsers = Math.max(...tests.map(t => t.concurrent_users));

    return {
      total_tests: totalTests,
      passed,
      failed,
      warning,
      avg_response_time: Math.round(avgResponseTime),
      max_concurrent_users: maxConcurrentUsers
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(tests: PerformanceTest[]): string[] {
    const recommendations: string[] = [];

    const failedTests = tests.filter(t => t.status === 'fail');
    const warningTests = tests.filter(t => t.status === 'warning');

    if (failedTests.length > 0) {
      recommendations.push(`Optimize performance for ${failedTests.length} failed tests`);
    }

    if (warningTests.length > 0) {
      recommendations.push(`Monitor performance for ${warningTests.length} tests with warnings`);
    }

    const slowTests = tests.filter(t => t.metrics.avg_response_time > 100);
    if (slowTests.length > 0) {
      recommendations.push(`Optimize response times for ${slowTests.length} slow endpoints`);
    }

    const lowSuccessRateTests = tests.filter(t => t.metrics.success_rate < 99);
    if (lowSuccessRateTests.length > 0) {
      recommendations.push(`Improve reliability for ${lowSuccessRateTests.length} endpoints with low success rates`);
    }

    const highLoadTests = tests.filter(t => t.concurrent_users >= 100);
    if (highLoadTests.some(t => t.status !== 'pass')) {
      recommendations.push('Implement caching and optimization for high-load scenarios');
    }

    return recommendations;
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(tests: PerformanceTest[]): 'pass' | 'fail' | 'warning' {
    const failedTests = tests.filter(t => t.status === 'fail');
    const warningTests = tests.filter(t => t.status === 'warning');

    if (failedTests.length > 0) {
      return 'fail';
    } else if (warningTests.length > 0) {
      return 'warning';
    } else {
      return 'pass';
    }
  }

  /**
   * Save performance report
   */
  private saveReport(report: PerformanceReport): void {
    const reportPath = join(process.cwd(), 'performance-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Performance report saved to ${reportPath}`);
  }

  /**
   * Run single performance test
   */
  async runSingleTest(config: {
    name: string;
    description: string;
    concurrent_users: number;
    duration_seconds: number;
    threshold_ms: number;
    testType: 'load' | 'api' | 'database';
  }): Promise<PerformanceTest> {
    switch (config.testType) {
      case 'load':
        return this.runLoadTest(config);
      case 'api':
        return this.runAPITest(config);
      case 'database':
        return this.runDatabaseTest(config);
      default:
        throw new Error(`Unknown test type: ${config.testType}`);
    }
  }
}

// Default performance tester instance
export const performanceTester = new PerformanceTester();
