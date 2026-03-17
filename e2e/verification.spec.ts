import { test, expect } from '@playwright/test';

test('verify landing page elements', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Take a full page screenshot to see what's actually rendered
  await page.screenshot({ path: 'debug-landing.png', fullPage: true });

  // Check for the main heading text (case insensitive)
  const heading = page.locator('h1');
  await expect(heading).toContainText('REACH THE', { timeout: 15000 });

  // Check for the 3D astronaut illustration
  const astronaut = page.locator('img[alt="3D Astronaut"]');
  await expect(astronaut).toBeVisible();

  // Check for buttons
  const joinButton = page.locator('button:has-text("Join Free")');
  await expect(joinButton).toBeVisible();
});

test('verify dashboard layout', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForTimeout(2000); // Wait for potential animations
  await page.screenshot({ path: 'debug-dashboard.png', fullPage: true });
});
