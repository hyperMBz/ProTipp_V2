/**
 * Kalkulátor E2E tesztek
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

import { test, expect } from '@playwright/test';

test.describe('Kalkulátor Funkció', () => {
  test.beforeEach(async ({ page }) => {
    // Navigálás a dashboard oldalra
    await page.goto('/dashboard');
    
    // Várás az oldal betöltésére
    await page.waitForLoadState('networkidle');
  });

  test('kalkulátor ikon megjelenik minden mérkőzéshez', async ({ page }) => {
    // Ellenőrzés, hogy vannak-e arbitrage lehetőségek
    const opportunities = page.locator('[data-testid="arbitrage-opportunity"]');
    await expect(opportunities.first()).toBeVisible();

    // Ellenőrzés, hogy minden mérkőzéshez van kalkulátor ikon
    const calculatorButtons = page.locator('[data-testid="calculator-button"]');
    const count = await calculatorButtons.count();
    expect(count).toBeGreaterThan(0);

    // Ellenőrzés, hogy a kalkulátor ikonok láthatók
    for (let i = 0; i < count; i++) {
      await expect(calculatorButtons.nth(i)).toBeVisible();
    }
  });

  test('kalkulátor modal megnyílik kattintásra', async ({ page }) => {
    // Első kalkulátor gomb megkeresése
    const firstCalculatorButton = page.locator('[data-testid="calculator-button"]').first();
    await expect(firstCalculatorButton).toBeVisible();

    // Kalkulátor gombra kattintás
    await firstCalculatorButton.click();

    // Modal megjelenés ellenőrzése
    const modal = page.locator('[data-testid="calculator-modal"]');
    await expect(modal).toBeVisible();

    // Modal tartalom ellenőrzése
    await expect(modal.locator('text=Profit Kalkulátor')).toBeVisible();
    await expect(modal.locator('text=Számítsd ki a potenciális profitot')).toBeVisible();
  });

  test('kalkulátor form működik helyesen', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Tét beviteli mező megkeresése
    const stakeInput = page.locator('input[placeholder="0"]');
    await expect(stakeInput).toBeVisible();

    // Tét megadása
    await stakeInput.fill('1000');

    // Számítás gomb megkeresése és kattintása
    const calculateButton = page.locator('button:has-text("Számítás")');
    await expect(calculateButton).toBeEnabled();
    await calculateButton.click();

    // Eredmények megjelenés ellenőrzése
    await expect(page.locator('text=Számítási Eredmények')).toBeVisible();
    await expect(page.locator('text=1,000 Ft')).toBeVisible();
  });

  test('gyors tét beállítások működnek', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Gyors tét gombok ellenőrzése
    const quickStakeButtons = page.locator('button:has-text("Ft")');
    const count = await quickStakeButtons.count();
    expect(count).toBeGreaterThan(0);

    // Gyors tét gombra kattintás
    await quickStakeButtons.first().click();

    // Tét beviteli mező ellenőrzése
    const stakeInput = page.locator('input[placeholder="0"]');
    const value = await stakeInput.inputValue();
    expect(value).not.toBe('');
  });

  test('profit számítás pontos', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Tét megadása
    await page.locator('input[placeholder="0"]').fill('1000');

    // Számítás
    await page.locator('button:has-text("Számítás")').click();

    // Eredmények ellenőrzése
    await expect(page.locator('text=1,000 Ft')).toBeVisible(); // Tét
    await expect(page.locator('text=2,500 Ft')).toBeVisible(); // Kifizetés (1000 * 2.5)
    await expect(page.locator('text=1,500 Ft')).toBeVisible(); // Profit (2500 - 1000)
  });

  test('kalkulátor modal bezárható', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Bezárás gomb megkeresése és kattintása
    const closeButton = page.locator('button[aria-label="Close"]');
    await closeButton.click();

    // Modal eltűnés ellenőrzése
    await expect(page.locator('[data-testid="calculator-modal"]')).not.toBeVisible();
  });

  test('kalkulátor modal ESC billentyűvel bezárható', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // ESC billentyű lenyomása
    await page.keyboard.press('Escape');

    // Modal eltűnés ellenőrzése
    await expect(page.locator('[data-testid="calculator-modal"]')).not.toBeVisible();
  });

  test('kalkulátor modal háttérre kattintva bezárható', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Modal háttérre kattintás
    await page.locator('[data-testid="calculator-modal"]').click({ position: { x: 10, y: 10 } });

    // Modal eltűnés ellenőrzése
    await expect(page.locator('[data-testid="calculator-modal"]')).not.toBeVisible();
  });

  test('tét validálás működik', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Negatív tét megadása
    await page.locator('input[placeholder="0"]').fill('-100');

    // Hibaüzenet ellenőrzése
    await expect(page.locator('text=A minimum tét 0 Ft')).toBeVisible();

    // Számítás gomb ellenőrzése (le kell legyen tiltva)
    const calculateButton = page.locator('button:has-text("Számítás")');
    await expect(calculateButton).toBeDisabled();
  });

  test('kalkulátor eredmények menthetők', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Tét megadása és számítás
    await page.locator('input[placeholder="0"]').fill('1000');
    await page.locator('button:has-text("Számítás")').click();

    // Mentés gomb megkeresése és kattintása
    const saveButton = page.locator('button:has-text("Mentés")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Sikeres mentés üzenet ellenőrzése
    await expect(page.locator('text=Kalkuláció mentve!')).toBeVisible();
  });

  test('kalkulátor eredmények megoszthatók', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Tét megadása és számítás
    await page.locator('input[placeholder="0"]').fill('1000');
    await page.locator('button:has-text("Számítás")').click();

    // Megosztás gomb megkeresése és kattintása
    const shareButton = page.locator('button:has-text("Megosztás")');
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    // Sikeres megosztás üzenet ellenőrzése
    await expect(page.locator('text=Szöveg vágólapra másolva!')).toBeVisible();
  });

  test('kalkulátor reszponzív design', async ({ page }) => {
    // Mobile viewport beállítása
    await page.setViewportSize({ width: 375, height: 667 });

    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Modal láthatóság ellenőrzése mobile nézetben
    const modal = page.locator('[data-testid="calculator-modal"]');
    await expect(modal).toBeVisible();

    // Tét beviteli mező elérhetőség ellenőrzése
    const stakeInput = page.locator('input[placeholder="0"]');
    await expect(stakeInput).toBeVisible();

    // Gyors tét gombok elérhetőség ellenőrzése
    const quickStakeButtons = page.locator('button:has-text("Ft")');
    await expect(quickStakeButtons.first()).toBeVisible();
  });

  test('kalkulátor accessibility', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // ARIA label ellenőrzése
    const calculatorButton = page.locator('[data-testid="calculator-button"]').first();
    await expect(calculatorButton).toHaveAttribute('aria-label');

    // Modal ARIA attribútumok ellenőrzése
    const modal = page.locator('[data-testid="calculator-modal"]');
    await expect(modal).toHaveAttribute('role', 'dialog');

    // Tét beviteli mező label ellenőrzése
    const stakeInput = page.locator('input[placeholder="0"]');
    await expect(stakeInput).toHaveAttribute('id');
    
    const label = page.locator('label[for]');
    await expect(label).toBeVisible();
  });

  test('kalkulátor keyboard navigation', async ({ page }) => {
    // Modal megnyitása
    await page.locator('[data-testid="calculator-button"]').first().click();
    await page.waitForSelector('[data-testid="calculator-modal"]');

    // Tab navigáció
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Tét beviteli mező fókusz ellenőrzése
    const stakeInput = page.locator('input[placeholder="0"]');
    await expect(stakeInput).toBeFocused();

    // Tét megadása és Enter lenyomása
    await stakeInput.fill('1000');
    await page.keyboard.press('Enter');

    // Eredmények megjelenés ellenőrzése
    await expect(page.locator('text=Számítási Eredmények')).toBeVisible();
  });
});
