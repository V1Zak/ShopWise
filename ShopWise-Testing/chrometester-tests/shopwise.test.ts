import { describe, it, beforeAll, expect } from '@chrometester/core';

const APP_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

describe('ShopWise Application', () => {
  describe('Authentication', () => {
    it('should load the login page', async ({ page }) => {
      await page.goto(APP_URL);
      await page.waitForSelector('input[type="email"]');

      const title = await page.title();
      expect(title).toContain('ShopWise');
    });

    it('should have Sign in button', async ({ page }) => {
      await page.goto(`${APP_URL}/auth`);

      const signInButton = await page.waitForSelector('text=Sign in');
      expect(signInButton).toBeTruthy();
    });

    it('should login successfully', async ({ page }) => {
      await page.goto(`${APP_URL}/auth`);

      // Click "Sign in" to switch to sign-in form
      await page.click('text=Sign in');
      await page.waitForTimeout(1000);

      // Fill credentials
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);

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
      await page.goto(`${APP_URL}/auth`);
      await page.click('text=Sign in');
      await page.waitForTimeout(1000);
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    });

    it('should display dashboard', async ({ page }) => {
      await page.goto(`${APP_URL}/dashboard`);
      await page.waitForSelector('text=Dashboard');

      const url = page.url();
      expect(url).toContain('/dashboard');
    });

    it('should show user greeting', async ({ page }) => {
      await page.goto(`${APP_URL}/dashboard`);

      const greeting = await page.waitForSelector('text=Good');
      expect(greeting).toBeTruthy();
    });
  });

  describe('Catalog', () => {
    beforeAll(async ({ page }) => {
      // Login before catalog tests
      await page.goto(`${APP_URL}/auth`);
      await page.click('text=Sign in');
      await page.waitForTimeout(1000);
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    });

    it('should display catalog page', async ({ page }) => {
      await page.goto(`${APP_URL}/catalog`);
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toContain('/catalog');
    });

    it('should display products', async ({ page }) => {
      await page.goto(`${APP_URL}/catalog`);
      await page.waitForTimeout(2000);

      const pageText = await page.textContent('body');
      expect(pageText).toContain('Eggs');
    });

    it('should have search input', async ({ page }) => {
      await page.goto(`${APP_URL}/catalog`);

      const searchInput = await page.waitForSelector('input[placeholder*="Search"]');
      expect(searchInput).toBeTruthy();
    });

    it('should have quick add input', async ({ page }) => {
      await page.goto(`${APP_URL}/catalog`);

      const quickAdd = await page.waitForSelector('input[placeholder*="Add item"]');
      expect(quickAdd).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    beforeAll(async ({ page }) => {
      // Login
      await page.goto(`${APP_URL}/auth`);
      await page.click('text=Sign in');
      await page.waitForTimeout(1000);
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    });

    it('should navigate to all main pages', async ({ page }) => {
      const pages = ['/dashboard', '/catalog', '/history', '/analytics', '/settings'];

      for (const pagePath of pages) {
        await page.goto(`${APP_URL}${pagePath}`);
        await page.waitForTimeout(1000);

        const url = page.url();
        // Should not redirect to auth
        expect(url).not.toContain('/auth');
      }
    });
  });
});
