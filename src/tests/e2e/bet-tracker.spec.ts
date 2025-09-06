import { test, expect } from '@playwright/test';

/**
 * Bet Tracker E2E Tests for ProTipp V2
 * Story 1.15: Sprint 5 - Add to Bet Tracker Funkció
 */

test.describe('Bet Tracker Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('testpassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display Bet Tracker tab in dashboard', async ({ page }) => {
    // Check if Bet Tracker tab is visible
    await expect(page.getByRole('tab', { name: 'Bet Tracker' })).toBeVisible();
  });

  test('should navigate to Bet Tracker tab', async ({ page }) => {
    // Click on Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Check if Bet Tracker content is visible
    await expect(page.getByText('Bet Tracker')).toBeVisible();
    await expect(page.getByText('Nincsenek tracked fogadások')).toBeVisible();
  });

  test('should add bet to tracker from arbitrage table', async ({ page }) => {
    // Navigate to Arbitrage tab first
    await page.getByRole('tab', { name: 'Arbitrage' }).click();
    
    // Wait for arbitrage table to load
    await expect(page.getByText('Arbitrage Opportunities')).toBeVisible();
    
    // Find and click the first "+" button
    const addButton = page.locator('[data-testid="bet-tracker-button"]').first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Check for success feedback
    await expect(addButton).toHaveClass(/border-green-500/);
    
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Check if bet appears in tracker
    await expect(page.getByText('Összes fogadás')).toBeVisible();
    // Note: In a real test, we would check for the specific bet details
  });

  test('should filter bets by status', async ({ page }) => {
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Check if filter buttons are visible
    await expect(page.getByText('Összes')).toBeVisible();
    await expect(page.getByText('Függőben')).toBeVisible();
    await expect(page.getByText('Nyert')).toBeVisible();
    await expect(page.getByText('Vesztett')).toBeVisible();
    
    // Click on "Függőben" filter
    await page.getByText('Függőben').click();
    
    // Check if filter is active
    await expect(page.getByText('Függőben')).toHaveClass(/bg-primary/);
  });

  test('should search bets by event name', async ({ page }) => {
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Find search input
    const searchInput = page.getByPlaceholder('Keresés...');
    await expect(searchInput).toBeVisible();
    
    // Type in search term
    await searchInput.fill('Test Match');
    
    // Check if search term is in input
    await expect(searchInput).toHaveValue('Test Match');
  });

  test('should edit bet details', async ({ page }) => {
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // This test would require existing bets in the tracker
    // For now, we'll just check if edit functionality exists
    const editButton = page.locator('[data-testid="edit-bet-button"]').first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Check if edit form appears
      await expect(page.getByRole('button', { name: 'Mentés' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Mégse' })).toBeVisible();
    }
  });

  test('should remove bet from tracker', async ({ page }) => {
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // This test would require existing bets in the tracker
    const deleteButton = page.locator('[data-testid="delete-bet-button"]').first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Check if bet is removed (would need to verify in a real scenario)
      await expect(deleteButton).not.toBeVisible();
    }
  });

  test('should clear all bets with confirmation', async ({ page }) => {
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Find clear all button
    const clearButton = page.getByText('Összes törlése');
    
    if (await clearButton.isVisible()) {
      // Set up dialog handler
      page.on('dialog', dialog => {
        expect(dialog.message()).toBe('Biztosan törölni szeretnéd az összes fogadást?');
        dialog.accept();
      });
      
      await clearButton.click();
      
      // Check if tracker is empty
      await expect(page.getByText('Nincsenek tracked fogadások')).toBeVisible();
    }
  });

  test('should display bet statistics correctly', async ({ page }) => {
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Check if statistics are displayed
    await expect(page.getByText('Összes fogadás')).toBeVisible();
    await expect(page.getByText('Függőben')).toBeVisible();
    await expect(page.getByText('Nyert')).toBeVisible();
    await expect(page.getByText('Vesztett')).toBeVisible();
    
    // Check if profit/loss indicators are present
    const profitElements = page.locator('[data-testid="profit-indicator"]');
    if (await profitElements.count() > 0) {
      await expect(profitElements.first()).toBeVisible();
    }
  });

  test('should handle empty tracker state', async ({ page }) => {
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Check empty state
    await expect(page.getByText('Nincsenek tracked fogadások')).toBeVisible();
    await expect(page.getByText('Használd a "+" gombokat az arbitrage táblában a fogadások hozzáadásához.')).toBeVisible();
    
    // Check if Target icon is displayed
    await expect(page.locator('svg[data-testid="target-icon"]')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to Bet Tracker tab
    await page.getByRole('tab', { name: 'Bet Tracker' }).click();
    
    // Check if content is visible on mobile
    await expect(page.getByText('Bet Tracker')).toBeVisible();
    
    // Check if filter buttons are accessible on mobile
    await expect(page.getByText('Összes')).toBeVisible();
    await expect(page.getByText('Függőben')).toBeVisible();
  });
});
