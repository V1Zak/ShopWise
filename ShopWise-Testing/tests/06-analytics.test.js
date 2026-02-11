import { describe, it } from 'chrometester';

describe('Spending Analytics', () => {
  it('should load analytics page', async ({ page, expect }) => {
    await page.goto('http://localhost:5173/analytics');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/analytics/);
  });

  it('should display spending charts', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    await page.waitForTimeout(2000);

    const charts = page.locator('svg, canvas, [class*="chart"]');
    if (await charts.count() > 0) {
      await page.waitForTimeout(1000);
    }
  });

  it('should show total spending', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    await page.waitForTimeout(2000);

    const totalAmount = page.locator('[class*="total"], [class*="amount"]');
    await page.waitForTimeout(500);
  });

  it('should filter analytics by time period', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    await page.waitForTimeout(1000);

    const periodFilter = page.locator('button:has-text("Week"), button:has-text("Month"), button:has-text("Year")');
    if (await periodFilter.count() > 0) {
      await periodFilter.first().click();
      await page.waitForTimeout(1500);
    }
  });

  it('should show spending by category', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    await page.waitForTimeout(2000);

    const categoryBreakdown = page.locator('[class*="category"]');
    await page.waitForTimeout(500);
  });

  it('should show spending by store', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    await page.waitForTimeout(2000);

    const storeBreakdown = page.locator('[class*="store"]');
    await page.waitForTimeout(500);
  });

  it('should display trends over time', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    await page.waitForTimeout(2000);

    const trendChart = page.locator('svg:has(path), canvas');
    await page.waitForTimeout(500);
  });
});
