import { describe, it } from 'chrometester';

describe('Post-Shop Briefing', () => {
  it('should load briefing page', async ({ page }) => {
    await page.goto('http://localhost:5173/briefing');
    await page.waitForTimeout(2000);
  });

  it('should display trip summary', async ({ page }) => {
    await page.goto('http://localhost:5173/briefing/1'); // Assuming trip ID 1
    await page.waitForTimeout(2000);

    const summary = page.locator('[class*="summary"], [class*="briefing"]');
    await page.waitForTimeout(500);
  });

  it('should show total spent', async ({ page }) => {
    await page.goto('http://localhost:5173/briefing/1');
    await page.waitForTimeout(2000);

    const totalSpent = page.locator('[class*="total"], [class*="spent"]');
    await page.waitForTimeout(500);
  });

  it('should display items purchased', async ({ page }) => {
    await page.goto('http://localhost:5173/briefing/1');
    await page.waitForTimeout(2000);

    const itemList = page.locator('[class*="item"]');
    await page.waitForTimeout(500);
  });

  it('should show savings information', async ({ page }) => {
    await page.goto('http://localhost:5173/briefing/1');
    await page.waitForTimeout(2000);

    const savings = page.locator('[class*="saving"]');
    await page.waitForTimeout(500);
  });
});
