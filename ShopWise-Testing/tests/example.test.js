import { describe, it } from 'chrometester';

describe('Example Test', () => {
  it('should load the homepage', async ({ page, expect }) => {
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle(/Home/);
  });
});
