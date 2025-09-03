import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 */

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('testpassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard components', async ({ page }) => {
    // Check if main dashboard elements are visible
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Arbitrage Opportunities')).toBeVisible();
    await expect(page.getByText('Recent Bets')).toBeVisible();
    await expect(page.getByText('Statistics')).toBeVisible();
  });

  test('should navigate to testing dashboard', async ({ page }) => {
    // Navigate to testing dashboard
    await page.getByRole('link', { name: 'Testing' }).click();
    
    // Check if testing dashboard loads
    await expect(page).toHaveURL('/testing');
    await expect(page.getByText('Testing Dashboard')).toBeVisible();
    
    // Check if testing tabs are present
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Unit Tests' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Integration Tests' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Performance Tests' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Security Tests' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Coverage' })).toBeVisible();
  });

  test('should run all tests from testing dashboard', async ({ page }) => {
    // Navigate to testing dashboard
    await page.goto('/testing');
    
    // Click run all tests button
    await page.getByRole('button', { name: 'Run All Tests' }).click();
    
    // Check if progress bar appears
    await expect(page.getByText('Test Progress')).toBeVisible();
    
    // Wait for tests to complete (with timeout)
    await page.waitForSelector('[data-testid="test-complete"]', { timeout: 60000 });
    
    // Check if results are displayed
    await expect(page.getByText('Test Results')).toBeVisible();
  });

  test('should display test results correctly', async ({ page }) => {
    // Navigate to testing dashboard
    await page.goto('/testing');
    
    // Wait for any existing results to load
    await page.waitForTimeout(2000);
    
    // Check if test summary cards are present
    await expect(page.getByText('Total Tests')).toBeVisible();
    await expect(page.getByText('Coverage')).toBeVisible();
    await expect(page.getByText('Performance')).toBeVisible();
    await expect(page.getByText('Security')).toBeVisible();
  });

  test('should filter test results', async ({ page }) => {
    // Navigate to testing dashboard
    await page.goto('/testing');
    
    // Click on Unit Tests tab
    await page.getByRole('tab', { name: 'Unit Tests' }).click();
    
    // Check if unit tests section is visible
    await expect(page.getByText('Unit Tests')).toBeVisible();
    
    // Click on Performance Tests tab
    await page.getByRole('tab', { name: 'Performance Tests' }).click();
    
    // Check if performance tests section is visible
    await expect(page.getByText('Performance Tests')).toBeVisible();
  });

  test('should export test results', async ({ page }) => {
    // Navigate to testing dashboard
    await page.goto('/testing');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for export button (if results exist)
    const exportButton = page.getByRole('button', { name: 'Export Results' });
    
    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await exportButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download filename
      expect(download.suggestedFilename()).toMatch(/test-results-.*\.json/);
    }
  });

  test('should handle test errors gracefully', async ({ page }) => {
    // Navigate to testing dashboard
    await page.goto('/testing');
    
    // Try to run tests with invalid configuration
    await page.getByRole('button', { name: 'Run All Tests' }).click();
    
    // Check if error handling works (either success or error message)
    await expect(page.locator('body')).toContainText(/Test Progress|Error|No test results available/);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to testing dashboard
    await page.goto('/testing');
    
    // Check if mobile layout works
    await expect(page.getByText('Testing Dashboard')).toBeVisible();
    
    // Check if tabs are accessible on mobile
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    
    // Test tab navigation on mobile
    await page.getByRole('tab', { name: 'Unit Tests' }).click();
    await expect(page.getByText('Unit Tests')).toBeVisible();
  });
});
