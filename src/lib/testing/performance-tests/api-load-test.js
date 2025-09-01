/**
 * API Load Test for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * k6 performance test for API endpoints
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test API endpoints
  const endpoints = [
    '/api/health',
    '/api/odds/latest',
    '/api/arbitrage/opportunities',
    '/api/user/profile',
  ];

  endpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);
    
    check(response, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response time < 500ms`]: (r) => r.timings.duration < 500,
    });
  });

  sleep(1);
}
