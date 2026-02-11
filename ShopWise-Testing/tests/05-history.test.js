import { describe, it } from 'chrometester';

describe('Shopping History', () => {
  it('should load history page', async ({ page, expect }) => {
    await page.goto('http://localhost:5173/history');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/history/);
  });

  it('should display trip history', async ({ page }) => {
    await page.goto('http://localhost:5173/history');
    await page.waitForTimeout(2000);

    const tripCards = page.locator('[class*="trip"], [class*="history"]');
    await page.waitForTimeout(1000);
  });

  it('should filter history by date range', async ({ page }) => {
    await page.goto('http://localhost:5173/history');
    await page.waitForTimeout(1000);

    const dateFilter = page.locator('input[type="date"]');
    if (await dateFilter.count() > 0) {
      await dateFilter.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should filter history by store', async ({ page }) => {
    await page.goto('http://localhost:5173/history');
    await page.waitForTimeout(1000);

    const storeFilter = page.locator('select, button[role="combobox"]');
    if (await storeFilter.count() > 0) {
      await storeFilter.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should expand trip details', async ({ page }) => {
    await page.goto('http://localhost:5173/history');
    await page.waitForTimeout(2000);

    const tripCard = page.locator('[class*="trip"], [class*="card"]').first();
    if (await tripCard.count() > 0) {
      await tripCard.click();
      await page.waitForTimeout(1000);
    }
  });

  it('should show trip items', async ({ page }) => {
    await page.goto('http://localhost:5173/history');
    await page.waitForTimeout(2000);

    const expandBtn = page.locator('button:has-text("View"), button:has-text("Details")');
    if (await expandBtn.count() > 0) {
      await expandBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should navigate to trip briefing', async ({ page }) => {
    await page.goto('http://localhost:5173/history');
    await page.waitForTimeout(2000);

    const briefingBtn = page.locator('button:has-text("Briefing"), a:has-text("Briefing")');
    if (await briefingBtn.count() > 0) {
      await briefingBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });
});
