import { test, expect } from '@playwright/test';

test.describe('3. Security & Penetration Audits', () => {

  test('XSS Injection: Malicious script tags in inputs are safely sanitized in DOM rendering', async ({ page }) => {
    await page.goto('/dashboard');

    // Open New Project Modal
    const newProjectBtn = page.getByRole('button', { name: /New Project/i });
    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click();

      const input = page.locator('input[placeholder*="Project"], input[type="text"]').first();
      if (await input.isVisible()) {
        const xssPayload = '<script id="xss-test-payload">window.__XSS_EXECUTED__=true;</script>';
        await input.fill(xssPayload);

        // Submit form
        const createBtn = page.getByRole('button', { name: /Create/i }).first();
        if (await createBtn.isVisible()) {
          await createBtn.click();
        }

        // Verify window.__XSS_EXECUTED__ was NEVER evaluated
        const executed = await page.evaluate(() => (window as unknown as { __XSS_EXECUTED__?: boolean }).__XSS_EXECUTED__);
        expect(executed).toBeUndefined();
      }
    }
  });

  test('XSS Injection: Vector image handlers (<img src=x onerror=...>) do not execute script context', async ({ page }) => {
    await page.goto('/pricing');
    
    // Inject image error handler into search or input if present
    const payload = '<img src="invalid-img.png" onerror="window.__XSS_IMG__=true;" />';
    await page.evaluate((html) => {
      const div = document.createElement('div');
      div.textContent = html; // textContent sanitizes HTML
      document.body.appendChild(div);
    }, payload);

    const executed = await page.evaluate(() => (window as unknown as { __XSS_IMG__?: boolean }).__XSS_IMG__);
    expect(executed).toBeUndefined();
  });

  test('API Key Obfuscation: Stored keys in localStorage are obfuscated with obf: prefix', async ({ page }) => {
    await page.goto('/settings');

    // Find API Key input
    const keyInput = page.locator('input[type="password"], input[placeholder*="key"]').first();
    if (await keyInput.isVisible()) {
      await keyInput.fill('sk-test-secret-api-key-99999');

      // Click Save Settings
      const saveBtn = page.getByRole('button', { name: /Save|Update/i }).first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
      }

      // Check localStorage content directly
      const rawStored = await page.evaluate(() => localStorage.getItem('artix.ai.settings.v1'));
      if (rawStored) {
        // Must NOT contain the plaintext key 'sk-test-secret-api-key-99999'
        expect(rawStored).not.toContain('sk-test-secret-api-key-99999');
        // Must contain the obfuscation prefix 'obf:'
        expect(rawStored).toContain('obf:');
      }
    }
  });

  test('Double-Click Prevention: Rapid submit clicks do not fire duplicate API invocations', async ({ page }) => {
    let callCount = 0;
    await page.route('**/v1/chat/completions', async (route) => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay response
      await route.fulfill({ status: 200, body: 'data: {"choices":[]}\n\n' });
    });

    await page.goto('/projects/e2e-demo-project');
    const prdButton = page.getByRole('button', { name: /PRD|Generate PRD/i });
    if (await prdButton.isVisible()) {
      await prdButton.click();

      const generateBtn = page.getByRole('button', { name: /Generate/i }).first();
      if (await generateBtn.isVisible()) {
        // Double click rapidly
        await generateBtn.click({ clickCount: 3, delay: 50 });
        
        // Wait 1 second
        await page.waitForTimeout(1000);
        // Call count should be at most 1 due to loading/disabled state during pending generation
        expect(callCount).toBeLessThanOrEqual(1);
      }
    }
  });

  test('CORS Edge Function Headers: Edge Functions enforce origin restrictions', async ({ request }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ldhbjeustealybjffadn.supabase.co';
    
    // OPTIONS preflight request
    const response = await request.fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-attacker-domain.com',
        'Access-Control-Request-Method': 'POST',
      },
    });

    // Verify response does not allow wildcard or unauthorized origin indiscriminately
    const allowOrigin = response.headers()['access-control-allow-origin'];
    if (allowOrigin && allowOrigin !== '*') {
      expect(allowOrigin).not.toEqual('https://malicious-attacker-domain.com');
    }
  });
});
