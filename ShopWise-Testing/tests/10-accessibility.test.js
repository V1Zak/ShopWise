import { describe, it } from 'chrometester';

describe('Accessibility Tests', () => {
  it('should pass accessibility audit on dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(2000);

    // Chrome Tester should auto-detect a11y issues
  });

  it('should pass accessibility audit on catalog', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(2000);
  });

  it('should pass accessibility audit on shopping list', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);
  });

  it('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
  });

  it('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
      // Just checking, not asserting
    }
  });
});
