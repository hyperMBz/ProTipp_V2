/**
 * Analytics Workflow E2E Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display analytics dashboard with all components', async ({ page }) => {
    // Check if main dashboard elements are present
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
    await expect(page.getByText('Teljesítmény Mutatók')).toBeVisible();
    await expect(page.getByText('Profit/Loss Grafikon')).toBeVisible();
    await expect(page.getByText('Fogadási Trendek')).toBeVisible();
    await expect(page.getByText('Export Panel')).toBeVisible();
  });

  test('should display summary statistics correctly', async ({ page }) => {
    // Check if summary statistics are displayed
    await expect(page.getByText('Összes Fogadás')).toBeVisible();
    await expect(page.getByText('Nyert Fogadások')).toBeVisible();
    await expect(page.getByText('Vesztett Fogadások')).toBeVisible();
    await expect(page.getByText('Függőben Lévő Fogadások')).toBeVisible();
    await expect(page.getByText('Összes Tét')).toBeVisible();
    await expect(page.getByText('Összes Kifizetés')).toBeVisible();
    await expect(page.getByText('Összes Profit')).toBeVisible();
    await expect(page.getByText('Sikerességi Arány')).toBeVisible();
  });

  test('should display performance metrics correctly', async ({ page }) => {
    // Check if performance metrics are displayed
    await expect(page.getByText('ROI')).toBeVisible();
    await expect(page.getByText('Sharpe Ratio')).toBeVisible();
    await expect(page.getByText('Max Drawdown')).toBeVisible();
    await expect(page.getByText('Átlagos Tét')).toBeVisible();
    await expect(page.getByText('Legjobb Nap')).toBeVisible();
    await expect(page.getByText('Legrosszabb Nap')).toBeVisible();
  });

  test('should display sport breakdown correctly', async ({ page }) => {
    // Check if sport breakdown is displayed
    await expect(page.getByText('Sportok')).toBeVisible();
    await expect(page.getByText('Futball')).toBeVisible();
    await expect(page.getByText('Kosárlabda')).toBeVisible();
    await expect(page.getByText('Tenisz')).toBeVisible();
  });

  test('should display bookmaker breakdown correctly', async ({ page }) => {
    // Check if bookmaker breakdown is displayed
    await expect(page.getByText('Fogadóirodák')).toBeVisible();
    await expect(page.getByText('Bet365')).toBeVisible();
    await expect(page.getByText('William Hill')).toBeVisible();
    await expect(page.getByText('Unibet')).toBeVisible();
  });

  test('should handle date range filter', async ({ page }) => {
    // Click on date range filter
    await page.getByText('Dátum Tartomány').click();
    
    // Select last 7 days
    await page.getByText('Utolsó 7 nap').click();
    
    // Wait for data to update
    await page.waitForLoadState('networkidle');
    
    // Check if data is updated
    await expect(page.getByText('Utolsó 7 nap')).toBeVisible();
  });

  test('should handle sport filter', async ({ page }) => {
    // Click on sport filter
    await page.getByText('Sportok').click();
    
    // Select soccer
    await page.getByText('Futball').click();
    
    // Wait for data to update
    await page.waitForLoadState('networkidle');
    
    // Check if data is updated
    await expect(page.getByText('Futball')).toBeVisible();
  });

  test('should handle bookmaker filter', async ({ page }) => {
    // Click on bookmaker filter
    await page.getByText('Fogadóirodák').click();
    
    // Select Bet365
    await page.getByText('Bet365').click();
    
    // Wait for data to update
    await page.waitForLoadState('networkidle');
    
    // Check if data is updated
    await expect(page.getByText('Bet365')).toBeVisible();
  });

  test('should handle combined filters', async ({ page }) => {
    // Apply multiple filters
    await page.getByText('Dátum Tartomány').click();
    await page.getByText('Utolsó 30 nap').click();
    
    await page.getByText('Sportok').click();
    await page.getByText('Futball').click();
    
    await page.getByText('Fogadóirodák').click();
    await page.getByText('Bet365').click();
    
    // Wait for data to update
    await page.waitForLoadState('networkidle');
    
    // Check if all filters are applied
    await expect(page.getByText('Utolsó 30 nap')).toBeVisible();
    await expect(page.getByText('Futball')).toBeVisible();
    await expect(page.getByText('Bet365')).toBeVisible();
  });

  test('should handle filter reset', async ({ page }) => {
    // Apply some filters
    await page.getByText('Dátum Tartomány').click();
    await page.getByText('Utolsó 7 nap').click();
    
    await page.getByText('Sportok').click();
    await page.getByText('Futball').click();
    
    // Reset filters
    await page.getByText('Szűrők Törlése').click();
    
    // Wait for data to update
    await page.waitForLoadState('networkidle');
    
    // Check if filters are reset
    await expect(page.getByText('Összes')).toBeVisible();
  });

  test('should handle profit/loss chart interaction', async ({ page }) => {
    // Check if chart is visible
    await expect(page.getByText('Profit/Loss Grafikon')).toBeVisible();
    
    // Check if chart controls are present
    await expect(page.getByText('Heti')).toBeVisible();
    await expect(page.getByText('Havi')).toBeVisible();
    await expect(page.getByText('Éves')).toBeVisible();
    
    // Change chart period
    await page.getByText('Havi').click();
    
    // Wait for chart to update
    await page.waitForLoadState('networkidle');
    
    // Check if period is updated
    await expect(page.getByText('Havi')).toBeVisible();
  });

  test('should handle betting trends chart interaction', async ({ page }) => {
    // Check if trends chart is visible
    await expect(page.getByText('Fogadási Trendek')).toBeVisible();
    
    // Check if trend indicators are present
    await expect(page.getByText('📈')).toBeVisible();
    await expect(page.getByText('📉')).toBeVisible();
  });

  test('should handle export functionality', async ({ page }) => {
    // Check if export panel is visible
    await expect(page.getByText('Export Panel')).toBeVisible();
    
    // Check if export buttons are present
    await expect(page.getByText('PDF Export')).toBeVisible();
    await expect(page.getByText('CSV Export')).toBeVisible();
    
    // Test PDF export
    await page.getByText('PDF Export').click();
    
    // Wait for export to complete
    await page.waitForTimeout(2000);
    
    // Check if export success message is shown
    await expect(page.getByText('Export sikeres!')).toBeVisible();
  });

  test('should handle CSV export', async ({ page }) => {
    // Test CSV export
    await page.getByText('CSV Export').click();
    
    // Wait for export to complete
    await page.waitForTimeout(2000);
    
    // Check if export success message is shown
    await expect(page.getByText('Export sikeres!')).toBeVisible();
  });

  test('should handle refresh functionality', async ({ page }) => {
    // Check if refresh button is present
    await expect(page.getByText('Frissítés')).toBeVisible();
    
    // Click refresh button
    await page.getByText('Frissítés').click();
    
    // Wait for data to refresh
    await page.waitForLoadState('networkidle');
    
    // Check if data is refreshed
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if dashboard is still visible
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check if dashboard is still visible
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check if dashboard is still visible
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
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
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[aria-label="Analytics Dashboard"]')).toBeVisible();
    
    // Check if buttons have proper ARIA labels
    await expect(page.locator('[aria-label="Refresh data"]')).toBeVisible();
    await expect(page.locator('[aria-label="Export to PDF"]')).toBeVisible();
    await expect(page.locator('[aria-label="Export to CSV"]')).toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/analytics/**', route => route.abort());
    
    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Wait for error to appear
    await page.waitForTimeout(3000);
    
    // Check if error message is shown
    await expect(page.getByText('Hiba történt az adatok betöltése során')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/analytics/**', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Check if loading state is shown
    await expect(page.getByText('Betöltés...')).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle');
    
    // Check if data is loaded
    await expect(page.getByText('Analytics Dashboard')).toBeVisible();
  });

  test('should handle empty data states', async ({ page }) => {
    // Simulate empty data response
    await page.route('**/api/analytics/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            totalBets: 0,
            wonBets: 0,
            lostBets: 0,
            pendingBets: 0,
            totalStake: 0,
            totalPayout: 0,
            totalProfit: 0,
            winRate: 0,
            avgProfitPerBet: 0
          },
          trends: [],
          performance: {
            roi: 0,
            sharpeRatio: 0,
            maxDrawdown: 0,
            avgBetSize: 0,
            bestDay: 0,
            worstDay: 0
          },
          sportBreakdown: [],
          bookmakerBreakdown: []
        })
      });
    });
    
    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check if empty state is shown
    await expect(page.getByText('Nincs elérhető adat')).toBeVisible();
  });

  test('should handle data updates in real-time', async ({ page }) => {
    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Wait for initial data to load
    await page.waitForLoadState('networkidle');
    
    // Simulate real-time update
    await page.route('**/api/analytics/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            totalBets: 151,
            wonBets: 96,
            lostBets: 45,
            pendingBets: 10,
            totalStake: 51000,
            totalPayout: 76000,
            totalProfit: 26000,
            winRate: 64.33,
            avgProfitPerBet: 172.67
          },
          trends: [
            { date: '2024-01-01', profit: 1000, bets: 5 },
            { date: '2024-01-02', profit: 1500, bets: 8 },
            { date: '2024-01-03', profit: -500, bets: 3 },
            { date: '2024-01-04', profit: 2000, bets: 10 }
          ],
          performance: {
            roi: 52.0,
            sharpeRatio: 1.3,
            maxDrawdown: -2000,
            avgBetSize: 340.33,
            bestDay: 2500,
            worstDay: -1000
          },
          sportBreakdown: [
            { sport: 'soccer', bets: 81, profit: 16000, winRate: 66 },
            { sport: 'basketball', bets: 50, profit: 8000, winRate: 60 },
            { sport: 'tennis', bets: 20, profit: 2000, winRate: 70 }
          ],
          bookmakerBreakdown: [
            { bookmaker: 'Bet365', bets: 61, profit: 13000, winRate: 66 },
            { bookmaker: 'William Hill', bets: 50, profit: 8000, winRate: 60 },
            { bookmaker: 'Unibet', bets: 40, profit: 5000, winRate: 62.5 }
          ]
        })
      });
    });
    
    // Wait for real-time update
    await page.waitForTimeout(3000);
    
    // Check if data is updated
    await expect(page.getByText('151')).toBeVisible();
    await expect(page.getByText('96')).toBeVisible();
    await expect(page.getByText('26000')).toBeVisible();
  });
});
