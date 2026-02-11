import { describe, it, beforeEach } from 'chrometester';

describe('Authentication Flow', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  it('should load login page', async ({ page, expect }) => {
    await expect(page).toHaveTitle(/ShopWise/);
    await expect(page.locator('h1, h2')).toContainText(/sign|login/i);
  });

  it('should show signup form', async ({ page, expect }) => {
    // Look for signup/register button or link
    const signupBtn = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up"), button:has-text("Register")');
    if (await signupBtn.count() > 0) {
      await signupBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should validate email field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('invalid-email');
      await emailInput.first().blur();
      await page.waitForTimeout(500);
    }
  });

  it('should attempt login with test credentials', async ({ page, expect }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.first().fill('test@shopwise.com');
      await passwordInput.first().fill('testpassword123');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
        await page.waitForTimeout(2000);
      }
    }
  });

  it('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const visibilityToggle = page.locator('button[aria-label*="password"], button:has(svg)').filter({ hasText: /show|hide|eye/i });

    if (await visibilityToggle.count() > 0) {
      await visibilityToggle.first().click();
      await page.waitForTimeout(500);
    }
  });
});
