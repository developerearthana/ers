import { test, expect } from '@playwright/test';

/**
 * Navigation E2E Tests
 * Tests critical navigation paths and module access
 */

test.describe('Navigation and Module Access', () => {
    test.beforeEach(async ({ page }) => {
        const testEmail = process.env.TEST_USER_EMAIL;
        const testPassword = process.env.TEST_USER_PASSWORD;

        // Skip all tests if credentials not provided
        test.skip(!testEmail || !testPassword, 'Test credentials not provided');

        // Login before each test
        await page.goto('/');
        await page.getByRole('textbox', { name: /email|username/i }).fill(testEmail!);
        await page.locator('input[type="password"]').fill(testPassword!);
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Wait for dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    });

    test('should navigate to dashboard successfully', async ({ page }) => {
        // Verify we're on the dashboard
        await expect(page).toHaveURL(/.*\/dashboard/);

        // Check for dashboard elements
        await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

        // Verify KPI cards or summary sections are visible
        const kpiCards = page.locator('[class*="card"], [class*="summary"]');
        await expect(kpiCards.first()).toBeVisible();
    });

    test('should navigate to Accounting module', async ({ page }) => {
        // Find and click Accounting link in navigation
        const accountingLink = page.getByRole('link', { name: /accounting|accounts/i });
        await accountingLink.click();

        // Verify navigation
        await expect(page).toHaveURL(/.*\/accounts/);

        // Check for accounting-specific content
        await expect(page.getByText(/transaction|ledger|balance/i).first()).toBeVisible();
    });

    test('should navigate to HRM module', async ({ page }) => {
        // Find and click HRM link
        const hrmLink = page.getByRole('link', { name: /hrm|human resource|hr/i });

        // Skip if HRM module doesn't exist
        if (!(await hrmLink.isVisible())) {
            test.skip();
        }

        await hrmLink.click();

        // Verify navigation
        await expect(page).toHaveURL(/.*\/hrm/);
    });

    test('should navigate to Sales module', async ({ page }) => {
        // Find and click Sales link
        const salesLink = page.getByRole('link', { name: /sales/i });

        // Skip if Sales module doesn't exist
        if (!(await salesLink.isVisible())) {
            test.skip();
        }

        await salesLink.click();

        // Verify navigation
        await expect(page).toHaveURL(/.*\/sales/);
    });

    test('should navigate to Inventory module', async ({ page }) => {
        // Find and click Inventory link
        const inventoryLink = page.getByRole('link', { name: /inventory|stock/i });

        // Skip if Inventory module doesn't exist
        if (!(await inventoryLink.isVisible())) {
            test.skip();
        }

        await inventoryLink.click();

        // Verify navigation
        await expect(page).toHaveURL(/.*\/inventory/);
    });

    test('should navigate to Settings page', async ({ page }) => {
        // Find settings link (might be in user menu or sidebar)
        const settingsLink = page.getByRole('link', { name: /settings|preferences/i });
        const userMenu = page.getByRole('button', { name: /user|account|profile/i });

        // Try to open user menu if settings is not directly visible
        if (await userMenu.isVisible() && !(await settingsLink.isVisible())) {
            await userMenu.click();
        }

        await settingsLink.click();

        // Verify navigation
        await expect(page).toHaveURL(/.*\/settings/);
    });

    test('should display sidebar navigation', async ({ page }) => {
        // Check if sidebar is visible
        const sidebar = page.locator('nav, aside, [role="navigation"]').first();
        await expect(sidebar).toBeVisible();

        // Verify multiple navigation links are present
        const navLinks = page.getByRole('link');
        const linkCount = await navLinks.count();
        expect(linkCount).toBeGreaterThan(3);
    });

    test('should handle breadcrumb navigation', async ({ page }) => {
        // Navigate to a nested page
        await page.goto('/accounts/transactions');

        // Check for breadcrumbs
        const breadcrumbs = page.locator('[aria-label="breadcrumb"], [class*="breadcrumb"]');

        if (await breadcrumbs.isVisible()) {
            // Verify breadcrumb contains expected items
            await expect(breadcrumbs).toContainText(/accounts|transactions/i);
        }
    });

    test('should navigate using browser back button', async ({ page }) => {
        // Navigate to accounting
        await page.getByRole('link', { name: /accounting|accounts/i }).click();
        await expect(page).toHaveURL(/.*\/accounts/);

        // Go back
        await page.goBack();

        // Should be back on dashboard
        await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should handle 404 for invalid routes', async ({ page }) => {
        // Navigate to non-existent page
        await page.goto('/this-page-does-not-exist-12345');

        // Check for 404 message or redirect
        const notFoundText = page.getByText(/404|not found|page.*exist/i);
        const dashboardRedirect = page.url().includes('/dashboard');

        // Either show 404 or redirect to dashboard
        expect(await notFoundText.isVisible() || dashboardRedirect).toBeTruthy();
    });

    test('should maintain active state in navigation', async ({ page }) => {
        // Navigate to accounting
        await page.getByRole('link', { name: /accounting|accounts/i }).click();

        // Check if the accounting link has active state
        const accountingLink = page.getByRole('link', { name: /accounting|accounts/i });
        const classes = await accountingLink.getAttribute('class');

        // Active link should have specific classes
        expect(classes).toMatch(/active|current|selected/i);
    });

    test('should load module pages within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        // Navigate to a module
        await page.getByRole('link', { name: /accounting|accounts/i }).click();
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('should display user information in header', async ({ page }) => {
        // Check for user name or email in header
        const header = page.locator('header, [role="banner"]');

        // Should contain user-related information
        await expect(header).toBeVisible();

        // Look for user menu or profile indicator
        const userElement = page.getByRole('button', { name: /user|account|profile/i });
        await expect(userElement).toBeVisible();
    });
});
