import { expect, test } from '@playwright/test';

/**
 * This test suite verifies the authentication system as configured in src/lib/auth.ts
 * Key configurations tested:
 * - Session duration (7 days)
 * - Cookie security attributes (HttpOnly, SameSite)
 * - Sign-in callback and toast notification
 * - Route protection and persistence
 */
test.describe('Auth System Verification (auth.ts)', () => {
	const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

	test('should verify sign-in and session configuration matches auth.ts', async ({
		page,
		context,
	}) => {
		// Increase timeout for the whole test
		test.setTimeout(60000);

		const timestamp = Date.now();
		const email = `auth-spec-${timestamp}@matricmaster.test`;
		const password = 'TestPassword123!';

		// 1. Establish a user via Sign Up
		console.log(`Establishing user: ${email}`);
		await page.goto('/sign-up');
		await page.fill('input[name="name"]', 'Auth Config User');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard/);

		// 2. Perform Explicit Sign In (to verify absolute callback and success toast)
		console.log('Testing explicit Sign In flow...');
		await context.clearCookies();
		await page.goto('/sign-in');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');

		// Verify 'Signed in as' toast notification (implemented in SignInForm.tsx)
		await expect(page.getByText(`Signed in as ${email}`)).toBeVisible({ timeout: 10000 });
		console.log('✅ Sign-in toast verified.');

		// Wait for redirection (approx 2s delay in SignInForm.tsx)
		await page.waitForURL(/\/dashboard/, { timeout: 15000 });
		console.log('✅ Redirected to dashboard after sign-in.');

		// 3. Verify Cookie Attributes (Verification of auth.ts settings)
		console.log('Verifying session cookie attributes...');
		const cookies = await context.cookies();
		const sessionToken = cookies.find((c) => c.name === 'better-auth.session_token');

		expect(sessionToken, 'better-auth.session_token cookie should be set').toBeDefined();

		if (sessionToken) {
			const now = Date.now() / 1000;
			const remainingTime = sessionToken.expires - now;
			const tolerance = 600; // 10 minutes

			// A. Check expiry matches expiresIn: 60 * 60 * 24 * 7 (auth.ts:74)
			console.log(`Remaining session time: ${remainingTime}s (Target: ${SEVEN_DAYS_SECONDS}s)`);
			expect(Math.abs(remainingTime - SEVEN_DAYS_SECONDS)).toBeLessThan(tolerance);
			console.log('✅ Session expiry (7 days) verified.');

			// B. Check HttpOnly security flag
			expect(sessionToken.httpOnly).toBe(true);
			console.log('✅ HttpOnly attribute verified.');

			// C. Check SameSite attribute (defaults to Lax)
			expect(['Lax', 'Strict']).toContain(sessionToken.sameSite);
			console.log(`✅ SameSite attribute verified: ${sessionToken.sameSite}`);

			// D. Check Secure attribute (auth.ts:91 uses process.env.NODE_ENV === 'production')
			console.log(`Secure attribute: ${sessionToken.secure}`);
		}

		// 4. Verify Session Persistence after Reload
		console.log('Verifying persistence after page reload...');
		await page.reload();
		await expect(page).toHaveURL(/\/dashboard/);
		console.log('✅ User remains authenticated after reload.');

		// 5. Verify Protected Route (CMS) Access
		console.log('Verifying protected route (CMS) access...');
		await page.goto('/cms');
		await expect(page).toHaveURL(/.*\/cms/);

		// Check for CMS specific content
		await expect(page.getByText(/Seed DB|Questions/i).first()).toBeVisible();
		console.log('✅ Protected route access verified.');

		// 6. Verify Session survives route change and another reload
		await page.goto('/dashboard');
		await page.reload();
		await expect(page.locator('button[aria-label="Open profile menu"]')).toBeVisible();
		console.log('✅ Overall session stability verified.');
	});
});
