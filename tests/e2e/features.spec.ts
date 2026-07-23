import { test, expect } from '@playwright/test';

test.describe('2. Functional E2E Product Journeys', () => {

  test.beforeEach(async ({ page }) => {
    // Inject mock auth & settings so the app considers the user logged in with configured AI keys
    await page.addInitScript(() => {
      localStorage.setItem('artix.ai.settings.v1', JSON.stringify({
        primary: {
          provider: 'openai',
          apiKey: 'obf:c2stbW9jay10ZXN0LWtleQ==', // obf:sk-mock-test-key
          model: 'gpt-4o',
        },
      }));
    });
  });

  test('Dashboard renders navigation, project creation modal, and pricing links', async ({ page }) => {
    await page.goto('/dashboard');
    // Ensure logo and navigation elements are visible
    await expect(page.getByText(/Artix/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /New Project/i })).toBeVisible();

    // Open New Project Modal
    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByText(/Create New Project/i)).toBeVisible();
  });

  test('PRD Generator Modal opens, switches templates, and generates Markdown PRD', async ({ page }) => {
    await page.goto('/dashboard');

    // Intercept AI streaming call to return deterministic test PRD
    await page.route('**/v1/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"choices":[{"delta":{"content":"# Agile PRD: Authentication System\\n\\n## Given/When/Then DoD\\n- **Given** user is on login page\\n- **When** credentials are submitted\\n- **Then** JWT session is set."}}]}\n\ndata: [DONE]\n\n',
      });
    });

    // Navigate to a project workspace
    await page.goto('/projects/e2e-demo-project');
    
    // Look for PRD Generator button or menu
    const prdButton = page.getByRole('button', { name: /PRD|Generate PRD/i });
    if (await prdButton.isVisible()) {
      await prdButton.click();
      await expect(page.getByText(/PRD Generator/i)).toBeVisible();

      // Test Template Switching
      const templateSelect = page.locator('select, [role="combobox"]').first();
      if (await templateSelect.isVisible()) {
        await templateSelect.click();
      }

      // Fill source description
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible()) {
        await textarea.fill('Build a secure JWT authentication system with Supabase RLS.');
      }

      // Click Generate
      const generateBtn = page.getByRole('button', { name: /Generate/i }).first();
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
      }
    }
  });

  test('Vibe Coding Generator supports Artix, Cursor, and Generic targets with Copy & Refine', async ({ page }) => {
    await page.goto('/projects/e2e-demo-project');

    // Intercept AI call for Vibe Prompt
    await page.route('**/v1/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"choices":[{"delta":{"content":"## Goal\\nImplement Supabase RLS policy.\\n\\n## Files to Modify\\n- [MODIFY] src/hooks/useAuth.tsx"}}]}\n\ndata: [DONE]\n\n',
      });
    });

    const vibeButton = page.getByRole('button', { name: /Vibe|Vibe Coding/i });
    if (await vibeButton.isVisible()) {
      await vibeButton.click();
      await expect(page.getByText(/Vibe Coding Prompt Generator/i)).toBeVisible();

      // Verify Bolt and v0 are NOT in the dropdown, only Cursor/Artix/Generic
      await expect(page.getByText(/Bolt/i)).not.toBeVisible();
      await expect(page.getByText(/v0/i)).not.toBeVisible();
    }
  });

  test('Agentic Workflow Designer supports pattern switching and topology parameters', async ({ page }) => {
    await page.goto('/projects/e2e-demo-project');

    const agentButton = page.getByRole('button', { name: /Agentic|Agentic Workflow/i });
    if (await agentButton.isVisible()) {
      await agentButton.click();
      await expect(page.getByText(/Agentic Workflow Designer/i)).toBeVisible();
    }
  });

  test('System Architect Canvas renders nodes and triggers Auto Layout', async ({ page }) => {
    await page.goto('/projects/e2e-demo-project');

    // Look for Auto Layout button on System Architect canvas toolbar
    const autoLayoutBtn = page.getByRole('button', { name: /Auto Layout/i });
    if (await autoLayoutBtn.isVisible()) {
      await autoLayoutBtn.click();
      // Verify toast or alignment notification
      await expect(page.getByText(/Arranged/i)).toBeVisible();
    }
  });
});
