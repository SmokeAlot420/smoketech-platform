import { test, expect } from '@playwright/test';

/**
 * Omega Workflow Integration Test
 *
 * Verifies:
 * 1. Navigation to workflow-generator page
 * 2. Template selection UI
 * 3. Configuration step
 * 4. Omega orchestrator integration
 * 5. Results display with metrics
 */

test.describe('Omega Workflow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set API key in localStorage
    await page.goto('http://localhost:7777');
    await page.evaluate(() => {
      localStorage.setItem('gemini_api_key', 'AIzaSyA7AwQNXJQOPnrTkNj4furl8sVtePgYoSQ');
    });
  });

  test('should navigate to workflow generator', async ({ page }) => {
    await page.goto('http://localhost:7777');

    // Click workflow tab in navigation
    await page.click('text=Workflow');

    // Verify we're on workflow-generator page
    await expect(page).toHaveURL('http://localhost:7777/workflow-generator');
    await expect(page.locator('h1')).toContainText('Workflow Generator');
  });

  test('should show template selector with 4 options', async ({ page }) => {
    await page.goto('http://localhost:7777/workflow-generator');

    // Verify all 4 template options are visible
    await expect(page.locator('text=Single Video')).toBeVisible();
    await expect(page.locator('text=Video Series')).toBeVisible();
    await expect(page.locator('text=Screen Recording')).toBeVisible();
    await expect(page.locator('text=Asset Animation')).toBeVisible();
  });

  test('should select template and proceed to configuration', async ({ page }) => {
    await page.goto('http://localhost:7777/workflow-generator');

    // Select "Single Video" template
    await page.click('text=Single Video');

    // Click Next button
    await page.click('text=Next →');

    // Verify we're on configuration step
    await expect(page.locator('text=Character Configuration')).toBeVisible();
    await expect(page.locator('text=Scenario')).toBeVisible();
    await expect(page.locator('text=VEO3 Options')).toBeVisible();
  });

  test('should configure workflow and start generation', async ({ page }) => {
    await page.goto('http://localhost:7777/workflow-generator');

    // Step 1: Select template
    await page.click('text=Single Video');
    await page.click('text=Next →');

    // Step 2: Configure (use default values, just modify prompt)
    await page.fill('textarea[placeholder*="Professional contractor"]', 'Test contractor for Omega workflow');

    // Start generation
    await page.click('text=Generate with Omega Workflow');

    // Verify generating state
    await expect(page.locator('text=Generating with Omega Workflow')).toBeVisible();
    await expect(page.locator('text=Using 12 engines')).toBeVisible();
  });

  test.skip('should display Omega metrics after generation', async ({ page }) => {
    // This test is skipped because it requires ~$6 and 15-25 minutes
    // Run manually when needed to verify end-to-end integration

    await page.goto('http://localhost:7777/workflow-generator');

    // Complete workflow
    await page.click('text=Single Video');
    await page.click('text=Next →');
    await page.click('text=Generate with Omega Workflow');

    // Wait for generation (max 30 minutes)
    await page.waitForSelector('text=Generation Complete', { timeout: 1800000 });

    // Verify Omega metrics are displayed
    await expect(page.locator('text=Omega Workflow Metrics')).toBeVisible();
    await expect(page.locator('text=Viral Score')).toBeVisible();
    await expect(page.locator('text=Quality Score')).toBeVisible();
    await expect(page.locator('text=Engines Used')).toBeVisible();
    await expect(page.locator('text=/12')).toBeVisible(); // Should show "X/12" engines

    // Verify metrics have reasonable values
    const viralScore = await page.locator('text=Viral Score').locator('..').locator('div').nth(1).textContent();
    expect(viralScore).toMatch(/\d+\/100/);
  });

  test('should have working navigation between all pages', async ({ page }) => {
    await page.goto('http://localhost:7777');

    // Navigate to Workflow Generator
    await page.click('text=Workflow');
    await expect(page).toHaveURL('http://localhost:7777/workflow-generator');

    // Navigate to Character Library
    await page.click('text=Character Library');
    await expect(page).toHaveURL('http://localhost:7777/character-library');

    // Navigate back to Home
    await page.click('text=Home');
    await expect(page).toHaveURL('http://localhost:7777/');
  });
});
