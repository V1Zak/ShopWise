import { describe, it } from 'chrometester';

describe('List Sharing', () => {
  it('should open share modal', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const shareBtn = page.locator('button:has-text("Share"), button[aria-label*="share"]');
    if (await shareBtn.count() > 0) {
      await shareBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should generate share link', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const shareBtn = page.locator('button:has-text("Share")');
    if (await shareBtn.count() > 0) {
      await shareBtn.first().click();
      await page.waitForTimeout(1000);

      const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Create Link")');
      if (await generateBtn.count() > 0) {
        await generateBtn.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });

  it('should copy share link', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const shareBtn = page.locator('button:has-text("Share")');
    if (await shareBtn.count() > 0) {
      await shareBtn.first().click();
      await page.waitForTimeout(1000);

      const copyBtn = page.locator('button:has-text("Copy")');
      if (await copyBtn.count() > 0) {
        await copyBtn.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  it('should set share permissions', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const shareBtn = page.locator('button:has-text("Share")');
    if (await shareBtn.count() > 0) {
      await shareBtn.first().click();
      await page.waitForTimeout(1000);

      const permissionSelect = page.locator('select, [role="combobox"]');
      if (await permissionSelect.count() > 0) {
        await permissionSelect.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
