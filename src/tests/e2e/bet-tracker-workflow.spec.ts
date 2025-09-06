/**
 * Bet Tracker Workflow E2E Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { test, expect } from '@playwright/test';

test.describe('Bet Tracker Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to bet tracker page
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display bet tracker panel with all components', async ({ page }) => {
    // Check if bet tracker panel is visible
    await expect(page.getByText('Bet Tracker')).toBeVisible();
    
    // Check if main components are present
    await expect(page.getByText('Követett Fogadások')).toBeVisible();
    await expect(page.getByText('Összes Fogadás')).toBeVisible();
    await expect(page.getByText('Összes Tét')).toBeVisible();
    await expect(page.getByText('Összes Profit')).toBeVisible();
    await expect(page.getByText('Sikerességi Arány')).toBeVisible();
  });

  test('should display tracked bets correctly', async ({ page }) => {
    // Check if tracked bets are displayed
    await expect(page.getByText('Manchester United vs Liverpool')).toBeVisible();
    await expect(page.getByText('Lakers vs Warriors')).toBeVisible();
    await expect(page.getByText('Djokovic vs Nadal')).toBeVisible();
    
    // Check if bet details are shown
    await expect(page.getByText('soccer')).toBeVisible();
    await expect(page.getByText('basketball')).toBeVisible();
    await expect(page.getByText('tennis')).toBeVisible();
    
    // Check if bookmakers are shown
    await expect(page.getByText('Bet365')).toBeVisible();
    await expect(page.getByText('William Hill')).toBeVisible();
    await expect(page.getByText('Unibet')).toBeVisible();
  });

  test('should display correct status badges', async ({ page }) => {
    // Check if status badges are displayed
    await expect(page.getByText('Függőben')).toBeVisible();
    await expect(page.getByText('Nyert')).toBeVisible();
    await expect(page.getByText('Vesztett')).toBeVisible();
  });

  test('should display correct profit colors', async ({ page }) => {
    // Check if positive profit is green
    await expect(page.locator('.text-green-400').first()).toBeVisible();
    
    // Check if negative profit is red
    await expect(page.locator('.text-red-400').first()).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    // Type in search input
    await page.getByPlaceholder('Keresés...').fill('Manchester');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Check if only matching results are shown
    await expect(page.getByText('Manchester United vs Liverpool')).toBeVisible();
    await expect(page.getByText('Lakers vs Warriors')).not.toBeVisible();
    await expect(page.getByText('Djokovic vs Nadal')).not.toBeVisible();
  });

  test('should handle status filter', async ({ page }) => {
    // Select pending status filter
    await page.getByDisplayValue('Összes').selectOption('pending');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Check if only pending bets are shown
    await expect(page.getByText('Manchester United vs Liverpool')).toBeVisible();
    await expect(page.getByText('Lakers vs Warriors')).not.toBeVisible();
    await expect(page.getByText('Djokovic vs Nadal')).not.toBeVisible();
  });

  test('should handle won status filter', async ({ page }) => {
    // Select won status filter
    await page.getByDisplayValue('Összes').selectOption('won');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Check if only won bets are shown
    await expect(page.getByText('Lakers vs Warriors')).toBeVisible();
    await expect(page.getByText('Manchester United vs Liverpool')).not.toBeVisible();
    await expect(page.getByText('Djokovic vs Nadal')).not.toBeVisible();
  });

  test('should handle lost status filter', async ({ page }) => {
    // Select lost status filter
    await page.getByDisplayValue('Összes').selectOption('lost');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Check if only lost bets are shown
    await expect(page.getByText('Djokovic vs Nadal')).toBeVisible();
    await expect(page.getByText('Manchester United vs Liverpool')).not.toBeVisible();
    await expect(page.getByText('Lakers vs Warriors')).not.toBeVisible();
  });

  test('should handle combined search and filter', async ({ page }) => {
    // Apply search
    await page.getByPlaceholder('Keresés...').fill('basketball');
    
    // Apply filter
    await page.getByDisplayValue('Összes').selectOption('won');
    
    // Wait for combined filter to apply
    await page.waitForTimeout(500);
    
    // Check if only matching results are shown
    await expect(page.getByText('Lakers vs Warriors')).toBeVisible();
    await expect(page.getByText('Manchester United vs Liverpool')).not.toBeVisible();
    await expect(page.getByText('Djokovic vs Nadal')).not.toBeVisible();
  });

  test('should handle bet editing', async ({ page }) => {
    // Click edit button for first bet
    await page.getByText('Szerkesztés').first().click();
    
    // Check if edit form is visible
    await expect(page.getByDisplayValue('100')).toBeVisible();
    await expect(page.getByDisplayValue('Test bet 1')).toBeVisible();
    await expect(page.getByDisplayValue('Függőben')).toBeVisible();
    
    // Update stake
    await page.getByDisplayValue('100').fill('150');
    
    // Update notes
    await page.getByDisplayValue('Test bet 1').fill('Updated notes');
    
    // Update status
    await page.getByDisplayValue('Függőben').selectOption('won');
    
    // Save changes
    await page.getByText('Mentés').click();
    
    // Wait for update to complete
    await page.waitForTimeout(1000);
    
    // Check if changes are saved
    await expect(page.getByText('150')).toBeVisible();
    await expect(page.getByText('Updated notes')).toBeVisible();
    await expect(page.getByText('Nyert')).toBeVisible();
  });

  test('should handle bet editing cancellation', async ({ page }) => {
    // Click edit button for first bet
    await page.getByText('Szerkesztés').first().click();
    
    // Make some changes
    await page.getByDisplayValue('100').fill('200');
    await page.getByDisplayValue('Test bet 1').fill('Changed notes');
    
    // Cancel editing
    await page.getByText('Mégse').click();
    
    // Check if changes are reverted
    await expect(page.getByText('100')).toBeVisible();
    await expect(page.getByText('Test bet 1')).toBeVisible();
  });

  test('should handle bet removal', async ({ page }) => {
    // Get initial bet count
    const initialCount = await page.getByText('3').textContent();
    
    // Click remove button for first bet
    await page.getByText('Törlés').first().click();
    
    // Wait for removal to complete
    await page.waitForTimeout(1000);
    
    // Check if bet is removed
    await expect(page.getByText('Manchester United vs Liverpool')).not.toBeVisible();
    
    // Check if count is updated
    const updatedCount = await page.getByText('2').textContent();
    expect(updatedCount).toBe('2');
  });

  test('should handle clear all bets', async ({ page }) => {
    // Click clear all button
    await page.getByText('Törlés').click();
    
    // Wait for clearing to complete
    await page.waitForTimeout(1000);
    
    // Check if all bets are removed
    await expect(page.getByText('Manchester United vs Liverpool')).not.toBeVisible();
    await expect(page.getByText('Lakers vs Warriors')).not.toBeVisible();
    await expect(page.getByText('Djokovic vs Nadal')).not.toBeVisible();
    
    // Check if empty state is shown
    await expect(page.getByText('Nincs követett fogadás')).toBeVisible();
    await expect(page.getByText('Kezdje el a fogadások követését az arbitrage táblából')).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // Clear all bets first
    await page.getByText('Törlés').click();
    await page.waitForTimeout(1000);
    
    // Check if empty state is displayed
    await expect(page.getByText('Nincs követett fogadás')).toBeVisible();
    await expect(page.getByText('Kezdje el a fogadások követését az arbitrage táblából')).toBeVisible();
    
    // Check if statistics show zero
    await expect(page.getByText('0')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/bet-tracker/**', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Check if loading state is shown
    await expect(page.getByText('Betöltés...')).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle');
    
    // Check if data is loaded
    await expect(page.getByText('Bet Tracker')).toBeVisible();
  });

  test('should handle error state', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/bet-tracker/**', route => route.abort());
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for error to appear
    await page.waitForTimeout(3000);
    
    // Check if error message is shown
    await expect(page.getByText('Hiba történt az adatok betöltése során')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if bet tracker is still visible
    await expect(page.getByText('Bet Tracker')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check if bet tracker is still visible
    await expect(page.getByText('Bet Tracker')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check if bet tracker is still visible
    await expect(page.getByText('Bet Tracker')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
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

  test('should handle accessibility features', async ({ page }) => {
    // Check if page has proper ARIA labels
    await expect(page.locator('[role="region"]')).toBeVisible();
    await expect(page.locator('[aria-label="Bet Tracker Panel"]')).toBeVisible();
    
    // Check if buttons have proper ARIA labels
    await expect(page.locator('[aria-label="Edit bet"]')).toBeVisible();
    await expect(page.locator('[aria-label="Remove bet"]')).toBeVisible();
    
    // Check if inputs have proper ARIA labels
    await expect(page.locator('[aria-label="Search bets"]')).toBeVisible();
    await expect(page.locator('[aria-label="Filter by status"]')).toBeVisible();
  });

  test('should handle large number of bets', async ({ page }) => {
    // Simulate large number of bets
    await page.route('**/api/bet-tracker/**', route => {
      const largeBetList = Array.from({ length: 100 }, (_, i) => ({
        id: `bet-${i}`,
        event_name: `Event ${i}`,
        sport: 'soccer',
        bookmaker: 'Bet365',
        odds: 2.0,
        stake: 100,
        potential_payout: 200,
        profit: 100,
        status: 'pending',
        notes: `Test bet ${i}`,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeBetList)
      });
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check if large number of bets is handled
    await expect(page.getByText('100')).toBeVisible();
    await expect(page.getByText('Event 0')).toBeVisible();
    await expect(page.getByText('Event 99')).toBeVisible();
  });

  test('should handle real-time updates', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for initial data to load
    await page.waitForLoadState('networkidle');
    
    // Simulate real-time update
    await page.route('**/api/bet-tracker/**', route => {
      const updatedBets = [
        ...mockTrackedBets,
        {
          id: '4',
          event_name: 'New Event',
          sport: 'tennis',
          bookmaker: 'Unibet',
          odds: 3.0,
          stake: 150,
          potential_payout: 450,
          profit: 300,
          status: 'pending',
          notes: 'New bet',
          created_at: new Date('2024-01-04'),
          updated_at: new Date('2024-01-04')
        }
      ];
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedBets)
      });
    });
    
    // Wait for real-time update
    await page.waitForTimeout(3000);
    
    // Check if new bet is added
    await expect(page.getByText('New Event')).toBeVisible();
    await expect(page.getByText('4')).toBeVisible();
  });

  test('should handle bet status updates', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for initial data to load
    await page.waitForLoadState('networkidle');
    
    // Edit bet status
    await page.getByText('Szerkesztés').first().click();
    await page.getByDisplayValue('Függőben').selectOption('won');
    await page.getByText('Mentés').click();
    
    // Wait for update to complete
    await page.waitForTimeout(1000);
    
    // Check if status is updated
    await expect(page.getByText('Nyert')).toBeVisible();
    
    // Check if statistics are updated
    await expect(page.getByText('2')).toBeVisible(); // wonBets
    await expect(page.getByText('1')).toBeVisible(); // pendingBets
  });

  test('should handle bet notes updates', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for initial data to load
    await page.waitForLoadState('networkidle');
    
    // Edit bet notes
    await page.getByText('Szerkesztés').first().click();
    await page.getByDisplayValue('Test bet 1').fill('Updated notes for bet 1');
    await page.getByText('Mentés').click();
    
    // Wait for update to complete
    await page.waitForTimeout(1000);
    
    // Check if notes are updated
    await expect(page.getByText('Updated notes for bet 1')).toBeVisible();
  });

  test('should handle bet stake updates', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for initial data to load
    await page.waitForLoadState('networkidle');
    
    // Edit bet stake
    await page.getByText('Szerkesztés').first().click();
    await page.getByDisplayValue('100').fill('200');
    await page.getByText('Mentés').click();
    
    // Wait for update to complete
    await page.waitForTimeout(1000);
    
    // Check if stake is updated
    await expect(page.getByText('200')).toBeVisible();
    
    // Check if statistics are updated
    await expect(page.getByText('400')).toBeVisible(); // totalStake
  });
});
