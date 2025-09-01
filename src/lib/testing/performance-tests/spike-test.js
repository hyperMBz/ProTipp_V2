/**
 * Spike Test for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * k6 spike test to test system behavior under sudden load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Normal load
    { duration: '1m', target: 100 },   // Spike to 100 users
    { duration: '10s', target: 10 },   // Scale down
    { duration: '1m', target: 10 },    // Sustained normal load
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.2'],     // Error rate must be below 20%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test critical endpoints during spike
  const criticalEndpoints = [
    '/api/health',
    '/api/odds/latest',
    '/api/arbitrage/opportunities',
  ];

  criticalEndpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);
    
    check(response, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000,
    });
  });

  sleep(1);
}
