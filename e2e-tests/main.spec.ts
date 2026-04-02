import { test, expect } from '@playwright/test';

test.describe('Admin Panel E2E', () => {
  test('should render the login page without crashing', async ({ page }) => {
    await page.goto('/');
    // Wait for redirect to login due to protected route
    await page.waitForURL('**/login');
    
    // Ensure the root container has content
    const rootElement = page.locator('#root, body').first();
    await expect(rootElement).toBeVisible();
  });

  test('should protect authenticated routes and redirect to login', async ({ page }) => {
    // Navigate to a protected route directly like users
    await page.goto('/users');
    
    // Expect a redirect to login
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should have expected auth inputs on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Look for common input fields for a smoke test
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput.first()).toBeVisible();
    
    const pwdInput = page.locator('input[type="password"], input[name="password"]');
    await expect(pwdInput.first()).toBeVisible();
    
    const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    await expect(submitBtn).toBeVisible();
  });
});
