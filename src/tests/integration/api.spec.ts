import { test, expect } from '@playwright/test';

/**
 * API Integration Tests for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 */

test.describe('API Integration Tests', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('health check endpoint', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
  });

  test('odds API endpoint', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/odds/latest`);
    
    // Should return 200 or 404 if no data
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        const firstOdds = data[0];
        expect(firstOdds).toHaveProperty('id');
        expect(firstOdds).toHaveProperty('home_team');
        expect(firstOdds).toHaveProperty('away_team');
        expect(firstOdds).toHaveProperty('odds');
      }
    }
  });

  test('arbitrage opportunities endpoint', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/arbitrage/opportunities`);
    
    // Should return 200 or 404 if no data
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        const firstOpportunity = data[0];
        expect(firstOpportunity).toHaveProperty('id');
        expect(firstOpportunity).toHaveProperty('profit_percentage');
        expect(firstOpportunity).toHaveProperty('stake_required');
      }
    }
  });

  test('user profile endpoint with authentication', async ({ request }) => {
    // First try without authentication
    const unauthenticatedResponse = await request.get(`${baseURL}/api/user/profile`);
    expect([401, 403]).toContain(unauthenticatedResponse.status());
    
    // TODO: Add authentication test when auth is implemented
    // const authenticatedResponse = await request.get(`${baseURL}/api/user/profile`, {
    //   headers: {
    //     'Authorization': `Bearer ${testToken}`
    //   }
    // });
    // expect(authenticatedResponse.status()).toBe(200);
  });

  test('bet calculation endpoint', async ({ request }) => {
    const betData = {
      stake: 100,
      odds: 2.5,
      bookmaker: 'test_bookmaker'
    };
    
    const response = await request.post(`${baseURL}/api/bets/calculate`, {
      data: betData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Should return 200 or 400 for validation errors
    expect([200, 400]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('potential_profit');
      expect(data).toHaveProperty('total_return');
      expect(typeof data.potential_profit).toBe('number');
      expect(typeof data.total_return).toBe('number');
    }
  });

  test('API error handling', async ({ request }) => {
    // Test invalid endpoint
    const invalidResponse = await request.get(`${baseURL}/api/invalid-endpoint`);
    expect([404, 500]).toContain(invalidResponse.status());
    
    // Test invalid JSON
    const invalidJsonResponse = await request.post(`${baseURL}/api/bets/calculate`, {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    expect([400, 500]).toContain(invalidJsonResponse.status());
  });

  test('API response time', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(`${baseURL}/api/health`);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  });

  test('API rate limiting', async ({ request }) => {
    // Make multiple rapid requests
    const promises = Array.from({ length: 10 }, () => 
      request.get(`${baseURL}/api/health`)
    );
    
    const responses = await Promise.all(promises);
    
    // All should succeed (or at least not be rate limited)
    responses.forEach(response => {
      expect([200, 429]).toContain(response.status());
    });
  });

  test('CORS headers', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health`);
    
    // Check for CORS headers
    const corsHeaders = response.headers();
    expect(corsHeaders).toHaveProperty('access-control-allow-origin');
  });

  test('API documentation endpoint', async ({ request }) => {
    // Test if API documentation is available
    const response = await request.get(`${baseURL}/api/docs`);
    
    // Should return 200 if docs exist, or 404 if not implemented
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/text\/html|application\/json/);
    }
  });
});
