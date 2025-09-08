#!/usr/bin/env node

/**
 * Load Testing Script for ProTipp V2
 * Tests rate limiting and performance under load
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  concurrentUsers: 50,
  requestsPerUser: 10,
  testDuration: 30000, // 30 seconds
  endpoints: [
    '/',
    '/dashboard',
    '/arbitrage',
    '/calculator',
    '/api/v1/arbitrage/opportunities',
    '/api/v1/analytics/performance'
  ]
};

// Statistics
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  responseTimes: [],
  errors: {},
  startTime: 0,
  endTime: 0
};

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'LoadTest/1.0',
        'Accept': 'text/html,application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        stats.totalRequests++;
        stats.responseTimes.push(responseTime);
        
        if (res.statusCode === 200) {
          stats.successfulRequests++;
        } else if (res.statusCode === 429) {
          stats.rateLimitedRequests++;
        } else {
          stats.failedRequests++;
          stats.errors[res.statusCode] = (stats.errors[res.statusCode] || 0) + 1;
        }
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data.substring(0, 100) // First 100 chars
        });
      });
    });
    
    req.on('error', (error) => {
      stats.totalRequests++;
      stats.failedRequests++;
      stats.errors['NETWORK_ERROR'] = (stats.errors['NETWORK_ERROR'] || 0) + 1;
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      stats.totalRequests++;
      stats.failedRequests++;
      stats.errors['TIMEOUT'] = (stats.errors['TIMEOUT'] || 0) + 1;
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Simulate user behavior
 */
async function simulateUser(userId) {
  const userStats = {
    requests: 0,
    errors: 0,
    rateLimited: 0
  };
  
  for (let i = 0; i < CONFIG.requestsPerUser; i++) {
    try {
      const endpoint = CONFIG.endpoints[Math.floor(Math.random() * CONFIG.endpoints.length)];
      const url = `${CONFIG.baseUrl}${endpoint}`;
      
      const result = await makeRequest(url);
      userStats.requests++;
      
      if (result.statusCode === 429) {
        userStats.rateLimited++;
        // Wait before retrying after rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Random delay between requests (100-500ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
      
    } catch (error) {
      userStats.errors++;
      console.error(`User ${userId} request failed:`, error.message);
    }
  }
  
  return userStats;
}

/**
 * Run load test
 */
async function runLoadTest() {
  console.log('🚀 Starting Load Test for ProTipp V2');
  console.log(`📊 Configuration:`);
  console.log(`   - Base URL: ${CONFIG.baseUrl}`);
  console.log(`   - Concurrent Users: ${CONFIG.concurrentUsers}`);
  console.log(`   - Requests per User: ${CONFIG.requestsPerUser}`);
  console.log(`   - Total Expected Requests: ${CONFIG.concurrentUsers * CONFIG.requestsPerUser}`);
  console.log(`   - Test Duration: ${CONFIG.testDuration / 1000}s`);
  console.log('');
  
  stats.startTime = performance.now();
  
  // Create user promises
  const userPromises = [];
  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    userPromises.push(simulateUser(i + 1));
  }
  
  // Wait for all users to complete
  const userResults = await Promise.all(userPromises);
  stats.endTime = performance.now();
  
  // Calculate statistics
  const totalTestTime = stats.endTime - stats.startTime;
  const avgResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
  const minResponseTime = Math.min(...stats.responseTimes);
  const maxResponseTime = Math.max(...stats.responseTimes);
  const requestsPerSecond = stats.totalRequests / (totalTestTime / 1000);
  const successRate = (stats.successfulRequests / stats.totalRequests) * 100;
  const rateLimitRate = (stats.rateLimitedRequests / stats.totalRequests) * 100;
  
  // Display results
  console.log('📈 Load Test Results:');
  console.log('====================');
  console.log(`⏱️  Total Test Time: ${(totalTestTime / 1000).toFixed(2)}s`);
  console.log(`📊 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful Requests: ${stats.successfulRequests}`);
  console.log(`❌ Failed Requests: ${stats.failedRequests}`);
  console.log(`🚫 Rate Limited Requests: ${stats.rateLimitedRequests}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`🚫 Rate Limit Rate: ${rateLimitRate.toFixed(2)}%`);
  console.log(`⚡ Requests per Second: ${requestsPerSecond.toFixed(2)}`);
  console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`⚡ Min Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`🐌 Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
  
  if (Object.keys(stats.errors).length > 0) {
    console.log('\n❌ Error Breakdown:');
    Object.entries(stats.errors).forEach(([error, count]) => {
      console.log(`   ${error}: ${count}`);
    });
  }
  
  // Performance assessment
  console.log('\n🎯 Performance Assessment:');
  if (successRate >= 95) {
    console.log('✅ EXCELLENT: Success rate above 95%');
  } else if (successRate >= 90) {
    console.log('✅ GOOD: Success rate above 90%');
  } else if (successRate >= 80) {
    console.log('⚠️  FAIR: Success rate above 80%');
  } else {
    console.log('❌ POOR: Success rate below 80%');
  }
  
  if (avgResponseTime <= 200) {
    console.log('✅ EXCELLENT: Average response time under 200ms');
  } else if (avgResponseTime <= 500) {
    console.log('✅ GOOD: Average response time under 500ms');
  } else if (avgResponseTime <= 1000) {
    console.log('⚠️  FAIR: Average response time under 1s');
  } else {
    console.log('❌ POOR: Average response time over 1s');
  }
  
  if (rateLimitRate <= 5) {
    console.log('✅ EXCELLENT: Rate limiting working properly (<5% rate limited)');
  } else if (rateLimitRate <= 10) {
    console.log('✅ GOOD: Rate limiting working well (<10% rate limited)');
  } else {
    console.log('⚠️  WARNING: High rate limiting rate (>10%)');
  }
  
  console.log('\n🏁 Load Test Complete!');
  
  // Return exit code based on performance
  if (successRate >= 90 && avgResponseTime <= 500 && rateLimitRate <= 10) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Performance issues detected
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Load test interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  runLoadTest().catch((error) => {
    console.error('💥 Load test failed:', error);
    process.exit(1);
  });
}

module.exports = { runLoadTest, CONFIG };
