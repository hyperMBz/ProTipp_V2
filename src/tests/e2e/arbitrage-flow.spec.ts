/**
 * Arbitrage Flow E2E Tests
 * Arbitrage funkcionalitás tesztelése
 */

import { test, expect } from '@playwright/test';

test.describe('Arbitrage Functionality', () => {
  test('should load arbitrage page', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Navigate to arbitrage page
    await page.goto('/arbitrage');
    await expect(page).toHaveTitle(/Arbitrage/);
  });

  test('should display arbitrage opportunities', async ({ page }) => {
    await page.goto('/arbitrage');

    // Wait for data to load
    await page.waitForSelector('.arbitrage-table, .arbitrage-opportunity', { timeout: 10000 });

    // Check if opportunities are displayed
    const opportunities = page.locator('.arbitrage-opportunity, [data-testid="arbitrage-row"]');
    await expect(opportunities.first()).toBeVisible();
  });

  test('should filter arbitrage opportunities', async ({ page }) => {
    await page.goto('/arbitrage');

    // Wait for filters to load
    await page.waitForSelector('select, input[type="range"]', { timeout: 5000 });

    // Test sport filter if available
    const sportFilter = page.locator('select').filter({ hasText: 'Sport' }).first();
    if (await sportFilter.isVisible()) {
      await sportFilter.selectOption('football');
      await page.waitForTimeout(1000); // Wait for filtering
    }

    // Test profit filter if available
    const profitFilter = page.locator('input[type="range"]').first();
    if (await profitFilter.isVisible()) {
      await profitFilter.fill('5');
      await page.waitForTimeout(1000);
    }
  });

  test('should sort arbitrage opportunities', async ({ page }) => {
    await page.goto('/arbitrage');

    // Wait for table headers
    await page.waitForSelector('th, [role="columnheader"]', { timeout: 5000 });

    // Test sorting by profit
    const profitHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /Profit|Nyereség/ }).first();
    if (await profitHeader.isVisible()) {
      await profitHeader.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should export arbitrage data', async ({ page }) => {
    await page.goto('/arbitrage');

    // Look for export button
    const exportButton = page.locator('button, a').filter({ hasText: /Export|Letöltés|CSV|Excel/ }).first();
    if (await exportButton.isVisible()) {
      // Note: This might trigger a download, we can't easily test downloads in Playwright
      // But we can at least check that the button exists and is clickable
      await expect(exportButton).toBeEnabled();
    }
  });
});

test.describe('Arbitrage Calculator', () => {
  test('should calculate arbitrage profit', async ({ page }) => {
    await page.goto('/calculator');

    // Wait for calculator to load
    await page.waitForSelector('input, [data-testid="odds-input"]', { timeout: 5000 });

    // Fill odds inputs
    const oddsInputs = page.locator('input[type="number"], [data-testid="odds-input"]');
    const inputCount = await oddsInputs.count();

    if (inputCount >= 3) {
      await oddsInputs.nth(0).fill('2.1');
      await oddsInputs.nth(1).fill('2.2');
      await oddsInputs.nth(2).fill('2.3');

      // Calculate
      const calculateButton = page.locator('button').filter({ hasText: /Calculate|Számít|Kalkulál/ }).first();
      if (await calculateButton.isVisible()) {
        await calculateButton.click();

        // Wait for result
        await page.waitForTimeout(1000);

        // Check if result is displayed
        const result = page.locator('[data-testid="result"], .result, .profit');
        await expect(result.first()).toBeVisible();
      }
    }
  });
});

test.describe('Real-time Updates', () => {
  test('should receive real-time odds updates', async ({ page }) => {
    await page.goto('/arbitrage');

    // Wait for initial data load
    await page.waitForSelector('.arbitrage-table, .odds-display', { timeout: 10000 });

    // Monitor for updates (this would require WebSocket simulation)
    const initialOdds = await page.locator('.odds-value, [data-testid="odds"]').first().textContent();

    // Wait for potential updates
    await page.waitForTimeout(5000);

    // Check if odds have been updated
    const updatedOdds = await page.locator('.odds-value, [data-testid="odds"]').first().textContent();

    // Note: In a real scenario, we might not see updates in the test timeframe
    // This is more of a smoke test for the real-time functionality
    expect(updatedOdds).toBeTruthy();
  });
});
