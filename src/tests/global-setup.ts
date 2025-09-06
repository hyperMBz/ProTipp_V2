/**
 * Global Setup for E2E Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    await page.goto(baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if the application is running
    const title = await page.title();
    console.log(`✅ Application is running with title: ${title}`);
    
    // Set up test data if needed
    await setupTestData(page);
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  // Set up any test data needed for E2E tests
  // This could include creating test users, setting up test data, etc.
  
  console.log('📊 Setting up test data...');
  
  // Example: Set up localStorage for tests
  await page.evaluate(() => {
    localStorage.setItem('test-mode', 'true');
    localStorage.setItem('test-user', JSON.stringify({
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
  
  console.log('✅ Test data setup completed');
}

export default globalSetup;
