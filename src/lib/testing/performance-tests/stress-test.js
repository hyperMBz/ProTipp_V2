/**
 * Stress Test for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * k6 stress test to find breaking points
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.15'],    // Error rate must be below 15%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate user behavior
  const userActions = [
    () => http.get(`${BASE_URL}/api/health`),
    () => http.get(`${BASE_URL}/api/odds/latest`),
    () => http.get(`${BASE_URL}/api/arbitrage/opportunities`),
    () => http.post(`${BASE_URL}/api/bets/calculate`, JSON.stringify({
      stake: 100,
      odds: 2.5,
      bookmaker: 'test'
    }), {
      headers: { 'Content-Type': 'application/json' }
    }),
  ];

  // Randomly select and execute user actions
  const randomAction = userActions[Math.floor(Math.random() * userActions.length)];
  const response = randomAction();
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
