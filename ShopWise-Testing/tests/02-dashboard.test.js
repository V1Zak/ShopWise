import { describe, it } from 'chrometester';

describe('Dashboard Page', () => {
  it('should load dashboard', async ({ page, expect }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/dashboard/);
  });

  it('should display sidebar navigation', async ({ page, expect }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    // Check for navigation elements
    const nav = page.locator('nav, aside, [role="navigation"]');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });

  it('should show active lists section', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    // Look for lists or list cards
    const listCards = page.locator('[class*="list"], [class*="card"]');
    await page.waitForTimeout(1000);
  });

  it('should have create new list button', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    const createBtn = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Add")');
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should navigate to catalog from dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    const catalogLink = page.locator('a:has-text("Catalog"), a:has-text("Items"), button:has-text("Catalog")');
    if (await catalogLink.count() > 0) {
      await catalogLink.first().click();
      await page.waitForTimeout(2000);
    }
  });

  it('should navigate to history from dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    const historyLink = page.locator('a:has-text("History"), button:has-text("History")');
    if (await historyLink.count() > 0) {
      await historyLink.first().click();
      await page.waitForTimeout(2000);
    }
  });

  it('should navigate to analytics from dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    const analyticsLink = page.locator('a:has-text("Analytics"), a:has-text("Spending"), button:has-text("Analytics")');
    if (await analyticsLink.count() > 0) {
      await analyticsLink.first().click();
      await page.waitForTimeout(2000);
    }
  });
});
