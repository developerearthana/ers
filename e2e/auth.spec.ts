import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests the complete authentication flow including login, logout, and error handling
 */

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the home page before each test
        await page.goto('/');
    });

    test('should display login page', async ({ page }) => {
        // Check if we're on the login page or redirected to it
        await expect(page).toHaveURL(/.*\/(login|signin|auth)/);

        // Verify login form elements are present
        await expect(page.getByRole('textbox', { name: /email|username/i })).toBeVisible();
        await expect(page.getByRole('textbox', { name: /password/i }).or(page.locator('input[type="password"]'))).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        // Navigate to login page
        await page.goto('/');

        // Fill in invalid credentials
        await page.getByRole('textbox', { name: /email|username/i }).fill('invalid@example.com');
        await page.locator('input[type="password"]').fill('wrongpassword');

        // Click login button
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Wait for error message
        await expect(page.getByText(/invalid|incorrect|wrong|failed/i)).toBeVisible({ timeout: 5000 });
    });

    test('should show validation error for empty fields', async ({ page }) => {
        // Navigate to login page
        await page.goto('/');

        // Try to submit without filling fields
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Check for validation errors
        const emailError = page.getByText(/email.*required|required.*email/i);
        const passwordError = page.getByText(/password.*required|required.*password/i);

        // At least one validation error should be visible
        await expect(emailError.or(passwordError)).toBeVisible({ timeout: 3000 });
    });

    test('should navigate to dashboard after successful login', async ({ page }) => {
        // This test requires valid test credentials
        // Skip if TEST_USER_EMAIL and TEST_USER_PASSWORD are not set
        const testEmail = process.env.TEST_USER_EMAIL;
        const testPassword = process.env.TEST_USER_PASSWORD;

        test.skip(!testEmail || !testPassword, 'Test credentials not provided');

        // Navigate to login page
        await page.goto('/');

        // Fill in valid credentials
        await page.getByRole('textbox', { name: /email|username/i }).fill(testEmail!);
        await page.locator('input[type="password"]').fill(testPassword!);

        // Click login button
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Wait for navigation to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

        // Verify dashboard elements are present
        await expect(page.getByRole('heading', { name: /dashboard|welcome/i })).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        const testEmail = process.env.TEST_USER_EMAIL;
        const testPassword = process.env.TEST_USER_PASSWORD;

        test.skip(!testEmail || !testPassword, 'Test credentials not provided');

        // Login first
        await page.goto('/');
        await page.getByRole('textbox', { name: /email|username/i }).fill(testEmail!);
        await page.locator('input[type="password"]').fill(testPassword!);
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Wait for dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

        // Find and click logout button (might be in a menu)
        const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
        const userMenu = page.getByRole('button', { name: /user|account|profile/i });

        // Try to open user menu if logout is not directly visible
        if (await userMenu.isVisible()) {
            await userMenu.click();
        }

        // Click logout
        await logoutButton.click();

        // Verify redirected to login page
        await expect(page).toHaveURL(/.*\/(login|signin|auth)/, { timeout: 5000 });
    });

    test('should handle rate limiting on failed login attempts', async ({ page }) => {
        // Navigate to login page
        await page.goto('/');

        // Attempt multiple failed logins
        for (let i = 0; i < 6; i++) {
            await page.getByRole('textbox', { name: /email|username/i }).fill('test@example.com');
            await page.locator('input[type="password"]').fill('wrongpassword');
            await page.getByRole('button', { name: /sign in|login/i }).click();

            // Wait a bit between attempts
            await page.waitForTimeout(500);
        }

        // Check for rate limit message
        await expect(page.getByText(/too many|rate limit|try again later/i)).toBeVisible({ timeout: 5000 });
    });

    test('should preserve redirect URL after login', async ({ page }) => {
        const testEmail = process.env.TEST_USER_EMAIL;
        const testPassword = process.env.TEST_USER_PASSWORD;

        test.skip(!testEmail || !testPassword, 'Test credentials not provided');

        // Try to access a protected page directly
        await page.goto('/accounts/settings');

        // Should be redirected to login
        await expect(page).toHaveURL(/.*\/(login|signin|auth)/);

        // Login
        await page.getByRole('textbox', { name: /email|username/i }).fill(testEmail!);
        await page.locator('input[type="password"]').fill(testPassword!);
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Should be redirected back to the originally requested page
        await expect(page).toHaveURL(/.*\/accounts\/settings/, { timeout: 10000 });
    });
});
