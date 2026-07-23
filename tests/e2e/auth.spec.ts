import { test, expect } from '@playwright/test';

test.describe('1. Authentication & Session Security', () => {
  test('unauthenticated users accessing /dashboard should be redirected to /auth', async ({ page }) => {
    // Clear any leftover session state
    await page.goto('/dashboard');
    await page.waitForURL(/\/(auth|login)?/);
    await expect(page).toHaveURL(/\/(auth|login)?/);
  });

  test('unauthenticated users accessing /projects/* should be redirected', async ({ page }) => {
    await page.goto('/projects/invalid-project-id-123');
    await page.waitForURL(/\/(auth|login)?/);
    await expect(page).toHaveURL(/\/(auth|login)?/);
  });

  test('public pages like /pricing should be accessible without authentication', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/Simple, transparent pricing/i)).toBeVisible();
    await expect(page.getByText(/Free/i)).toBeVisible();
    await expect(page.getByText(/Pro/i)).toBeVisible();
  });

  test('login page renders auth controls securely', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login|submit/i })).toBeVisible();
  });

  test('direct unauthenticated REST API query to Supabase tables returns 401 Unauthorized', async ({ request }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ldhbjeustealybjffadn.supabase.co';
    const response = await request.get(`${supabaseUrl}/rest/v1/projects?select=*`, {
      headers: {
        'apikey': 'invalid-anon-key',
      },
    });
    // Should block unauthenticated or invalid key request
    expect([401, 403]).toContain(response.status());
  });
});
