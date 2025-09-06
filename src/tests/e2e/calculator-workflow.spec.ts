/**
 * Calculator Workflow E2E Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { test, expect } from '@playwright/test';

test.describe('Calculator Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should open calculator modal when calculator button is clicked', async ({ page }) => {
    // Click calculator button for first opportunity
    await page.getByText('Kalkulátor').first().click();
    
    // Check if calculator modal is opened
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    await expect(page.getByText('Manchester United vs Liverpool')).toBeVisible();
  });

  test('should display opportunity information in calculator', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if opportunity information is displayed
    await expect(page.getByText('Manchester United vs Liverpool')).toBeVisible();
    await expect(page.getByText('soccer')).toBeVisible();
    await expect(page.getByText('Bet365')).toBeVisible();
    await expect(page.getByText('2.5')).toBeVisible();
    await expect(page.getByText('5.2%')).toBeVisible();
  });

  test('should handle stake input', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if stake input is visible
    await expect(page.getByLabel('Tét összege')).toBeVisible();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('150');
    
    // Check if stake is entered
    await expect(page.getByLabel('Tét összege')).toHaveValue('150');
  });

  test('should handle quick stake buttons', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if quick stake buttons are visible
    await expect(page.getByText('100')).toBeVisible();
    await expect(page.getByText('500')).toBeVisible();
    await expect(page.getByText('1000')).toBeVisible();
    await expect(page.getByText('2500')).toBeVisible();
    await expect(page.getByText('5000')).toBeVisible();
    await expect(page.getByText('10000')).toBeVisible();
    
    // Click quick stake button
    await page.getByText('500').click();
    
    // Check if stake is set
    await expect(page.getByLabel('Tét összege')).toHaveValue('500');
  });

  test('should perform calculation', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('Számítási Eredmények')).toBeVisible();
    await expect(page.getByText('200')).toBeVisible(); // stake
    await expect(page.getByText('500')).toBeVisible(); // payout
    await expect(page.getByText('300')).toBeVisible(); // profit
    await expect(page.getByText('150%')).toBeVisible(); // roi
  });

  test('should display calculation breakdown', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if breakdown is displayed
    await expect(page.getByText('Bet365')).toBeVisible();
    await expect(page.getByText('2.5')).toBeVisible();
    await expect(page.getByText('200')).toBeVisible();
    await expect(page.getByText('500')).toBeVisible();
  });

  test('should handle calculation with different stake amounts', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Test with different stake amounts
    const stakeAmounts = [100, 250, 500, 1000, 2500];
    
    for (const stake of stakeAmounts) {
      // Enter stake amount
      await page.getByLabel('Tét összege').fill(stake.toString());
      
      // Click calculate button
      await page.getByText('Számítás').click();
      
      // Wait for calculation to complete
      await page.waitForTimeout(500);
      
      // Check if results are displayed
      await expect(page.getByText(stake.toString())).toBeVisible();
    }
  });

  test('should handle calculation with decimal stake amounts', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter decimal stake amount
    await page.getByLabel('Tét összege').fill('150.50');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('150.50')).toBeVisible();
  });

  test('should handle calculation with zero stake', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter zero stake amount
    await page.getByLabel('Tét összege').fill('0');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('0')).toBeVisible();
  });

  test('should handle calculation with very large stake', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter very large stake amount
    await page.getByLabel('Tét összege').fill('1000000');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('1,000,000')).toBeVisible();
  });

  test('should handle stake validation', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter negative stake amount
    await page.getByLabel('Tét összege').fill('-100');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Check if validation error is shown
    await expect(page.getByText('A tét összege nem lehet negatív')).toBeVisible();
  });

  test('should handle stake validation for zero', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter zero stake amount
    await page.getByLabel('Tét összege').fill('0');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Check if validation error is shown
    await expect(page.getByText('A tét összege nem lehet nulla')).toBeVisible();
  });

  test('should handle stake validation for too high amount', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter too high stake amount
    await page.getByLabel('Tét összege').fill('10000000');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Check if validation error is shown
    await expect(page.getByText('A tét összege túl magas')).toBeVisible();
  });

  test('should handle reset functionality', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click reset button
    await page.getByText('Reset').click();
    
    // Check if stake is reset
    await expect(page.getByLabel('Tét összege')).toHaveValue('100');
  });

  test('should handle save functionality', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Click save button
    await page.getByText('Mentés').click();
    
    // Check if save success message is shown
    await expect(page.getByText('Kalkuláció mentve!')).toBeVisible();
  });

  test('should handle share functionality', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Click share button
    await page.getByText('Megosztás').click();
    
    // Check if share success message is shown
    await expect(page.getByText('Kalkuláció megosztva!')).toBeVisible();
  });

  test('should handle modal close with close button', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if modal is open
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    
    // Click close button
    await page.getByText('Bezárás').click();
    
    // Check if modal is closed
    await expect(page.getByText('Kalkulátor')).not.toBeVisible();
  });

  test('should handle modal close with X button', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if modal is open
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    
    // Click X button
    await page.getByTestId('close-icon').click();
    
    // Check if modal is closed
    await expect(page.getByText('Kalkulátor')).not.toBeVisible();
  });

  test('should handle modal close with escape key', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if modal is open
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    
    // Press escape key
    await page.keyboard.press('Escape');
    
    // Check if modal is closed
    await expect(page.getByText('Kalkulátor')).not.toBeVisible();
  });

  test('should handle modal close with backdrop click', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if modal is open
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    
    // Click backdrop
    await page.getByTestId('modal-backdrop').click();
    
    // Check if modal is closed
    await expect(page.getByText('Kalkulátor')).not.toBeVisible();
  });

  test('should not close modal when clicking inside content', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if modal is open
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    
    // Click inside content
    await page.getByTestId('modal-content').click();
    
    // Check if modal is still open
    await expect(page.getByText('Kalkulátor')).toBeVisible();
  });

  test('should handle Enter key for calculation', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Press Enter key
    await page.getByLabel('Tét összege').press('Enter');
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('Számítási Eredmények')).toBeVisible();
  });

  test('should handle loading state during calculation', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Check if loading state is shown
    await expect(page.getByText('Számítás...')).toBeVisible();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('Számítási Eredmények')).toBeVisible();
  });

  test('should handle calculation error', async ({ page }) => {
    // Simulate calculation error
    await page.route('**/api/calculator/**', route => route.abort());
    
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for error to appear
    await page.waitForTimeout(2000);
    
    // Check if error message is shown
    await expect(page.getByText('Hiba történt a számítás során')).toBeVisible();
  });

  test('should handle different opportunities', async ({ page }) => {
    // Open calculator modal for first opportunity
    await page.getByText('Kalkulátor').first().click();
    
    // Check if first opportunity is displayed
    await expect(page.getByText('Manchester United vs Liverpool')).toBeVisible();
    
    // Close modal
    await page.getByText('Bezárás').click();
    
    // Open calculator modal for second opportunity
    await page.getByText('Kalkulátor').nth(1).click();
    
    // Check if second opportunity is displayed
    await expect(page.getByText('Lakers vs Warriors')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if modal is still visible
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check if modal is still visible
    await expect(page.getByText('Kalkulátor')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check if modal is still visible
    await expect(page.getByText('Kalkulátor')).toBeVisible();
  });

  test('should handle accessibility features', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Check if modal has proper ARIA attributes
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[aria-modal="true"]')).toBeVisible();
    await expect(page.locator('[aria-labelledby="calculator-title"]')).toBeVisible();
    
    // Check if buttons have proper ARIA labels
    await expect(page.locator('[aria-label="Close calculator"]')).toBeVisible();
    await expect(page.locator('[aria-label="Calculate results"]')).toBeVisible();
    
    // Check if inputs have proper ARIA labels
    await expect(page.locator('[aria-label="Stake amount"]')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test Enter key
    await page.keyboard.press('Enter');
    
    // Test Space key
    await page.keyboard.press(' ');
  });

  test('should handle multiple calculations', async ({ page }) => {
    // Open calculator modal
    await page.getByText('Kalkulátor').first().click();
    
    // Perform multiple calculations
    const stakeAmounts = [100, 200, 300, 400, 500];
    
    for (const stake of stakeAmounts) {
      // Enter stake amount
      await page.getByLabel('Tét összege').fill(stake.toString());
      
      // Click calculate button
      await page.getByText('Számítás').click();
      
      // Wait for calculation to complete
      await page.waitForTimeout(500);
      
      // Check if results are displayed
      await expect(page.getByText(stake.toString())).toBeVisible();
    }
  });

  test('should handle calculation with different opportunities', async ({ page }) => {
    // Open calculator modal for first opportunity
    await page.getByText('Kalkulátor').first().click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('Számítási Eredmények')).toBeVisible();
    
    // Close modal
    await page.getByText('Bezárás').click();
    
    // Open calculator modal for second opportunity
    await page.getByText('Kalkulátor').nth(1).click();
    
    // Enter stake amount
    await page.getByLabel('Tét összege').fill('200');
    
    // Click calculate button
    await page.getByText('Számítás').click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.getByText('Számítási Eredmények')).toBeVisible();
  });
});
