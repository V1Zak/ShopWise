import { describe, it, beforeAll, expect } from 'chrometester';

const TEST_USER = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

describe('ShopWise Application', () => {
  describe('Authentication', () => {
    it('should load the login page', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });

      const title = await page.title();
      expect(title).toContain('ShopWise');
    });

    it('should have Sign in button', async ({ page }) => {
      await page.goto('/auth');

      const bodyText = await page.evaluate(() => document.body.textContent || '');
      expect(bodyText).toContain('Sign in');
    });

    it('should login successfully', async ({ page }) => {
      await page.goto('/auth');

      // Click "Sign in" to switch to sign-in form
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const signInBtn = buttons.find(btn =>
          btn.textContent?.includes('Sign in') && !btn.textContent?.includes('Continue')
        );
        if (signInBtn instanceof HTMLElement) {
          signInBtn.click();
        }
      });

      await page.waitForTimeout(1000);

      // Fill credentials
      await page.type('input[type="email"]', TEST_USER.email);
      await page.type('input[type="password"]', TEST_USER.password);

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);

      // Verify redirect
      const url = page.url();
      expect(url).not.toContain('/auth');
    });
  });

  describe('Dashboard', () => {
    beforeAll(async ({ page }) => {
      // Login before dashboard tests
      await page.goto('/auth');

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const signInBtn = buttons.find(btn =>
          btn.textContent?.includes('Sign in') && !btn.textContent?.includes('Continue')
        );
        if (signInBtn instanceof HTMLElement) {
          signInBtn.click();
        }
      });

      await page.waitForTimeout(1000);
      await page.type('input[type="email"]', TEST_USER.email);
      await page.type('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    });

    it('should display dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForSelector('text=Dashboard', { timeout: 5000 }).catch(() => {
        // Fallback to checking URL
      });

      const url = page.url();
      expect(url).toContain('/dashboard');
    });

    it('should show user greeting', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      const bodyText = await page.evaluate(() => document.body.textContent || '');
      expect(bodyText).toContain('Good');
    });
  });

  describe('Catalog', () => {
    beforeAll(async ({ page }) => {
      // Login before catalog tests
      await page.goto('/auth');

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const signInBtn = buttons.find(btn =>
          btn.textContent?.includes('Sign in') && !btn.textContent?.includes('Continue')
        );
        if (signInBtn instanceof HTMLElement) {
          signInBtn.click();
        }
      });

      await page.waitForTimeout(1000);
      await page.type('input[type="email"]', TEST_USER.email);
      await page.type('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    });

    it('should display catalog page', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toContain('/catalog');
    });

    it('should display products', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForTimeout(2000);

      const bodyText = await page.evaluate(() => document.body.textContent || '');
      expect(bodyText).toContain('Eggs');
    });

    it('should have search input', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForTimeout(1000);

      const searchInput = await page.$('input[placeholder*="Search"]');
      expect(searchInput).not.toBeNull();
    });

    it('should have quick add input', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForTimeout(1000);

      const quickAdd = await page.$('input[placeholder*="Add item"]');
      expect(quickAdd).not.toBeNull();
    });
  });
});
