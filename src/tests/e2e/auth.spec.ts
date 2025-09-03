import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Check if login form elements are present
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Fill in invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Fill in valid credentials (use test user)
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('testpassword123');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check if redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check if user is logged in
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('should allow user to logout', async ({ page }) => {
    // First login
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('testpassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
    
    // Click logout button
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Check if redirected to home page
    await expect(page).toHaveURL('/');
    
    // Check if login button is visible
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });
});
