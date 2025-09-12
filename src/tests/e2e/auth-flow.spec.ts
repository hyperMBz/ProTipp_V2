/**
 * Authentication Flow E2E Tests
 * Bejelentkezési és regisztrációs folyamatok tesztelése
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete registration flow', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Ingyenes Regisztráció');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.fill('input[name="confirmPassword"]', 'testpassword123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or show success message
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should complete login flow', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Bejelentkezés');
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Hibás email vagy jelszó')).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should allow authenticated users to access dashboard', async ({ page }) => {
    // This would require authentication setup
    // For now, skip this test
    test.skip();
  });
});

test.describe('Password Recovery', () => {
  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.click('text=Elfelejtetted a jelszavadat?');

    // Fill email for password reset
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Jelszó visszaállítási email elküldve')).toBeVisible();
  });
});
