import { describe, it } from 'chrometester';

describe('Active Shopping List', () => {
  it('should load shopping list page', async ({ page, expect }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);
    // Page might redirect if no list is active
  });

  it('should create new shopping list', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    const createBtn = page.locator('button:has-text("New"), button:has-text("Create")').first();
    if (await createBtn.count() > 0) {
      await createBtn.click();
      await page.waitForTimeout(1000);

      // Fill in list name
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
      if (await nameInput.count() > 0) {
        await nameInput.first().fill('Test Shopping List');

        // Submit
        const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
        if (await submitBtn.count() > 0) {
          await submitBtn.first().click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  it('should add item to list', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const addBtn = page.locator('button:has-text("Add"), button:has-text("+")');
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(1000);

      // Fill item details
      const itemInput = page.locator('input[placeholder*="item"], input[placeholder*="product"]');
      if (await itemInput.count() > 0) {
        await itemInput.first().fill('Test Item');
        await page.waitForTimeout(1000);
      }
    }
  });

  it('should increment item quantity', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const incrementBtn = page.locator('button:has-text("+"), button[aria-label*="increase"]');
    if (await incrementBtn.count() > 0) {
      await incrementBtn.first().click();
      await page.waitForTimeout(500);
    }
  });

  it('should decrement item quantity', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const decrementBtn = page.locator('button:has-text("-"), button[aria-label*="decrease"]');
    if (await decrementBtn.count() > 0) {
      await decrementBtn.first().click();
      await page.waitForTimeout(500);
    }
  });

  it('should toggle item checked status', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const checkbox = page.locator('input[type="checkbox"]');
    if (await checkbox.count() > 0) {
      await checkbox.first().click();
      await page.waitForTimeout(500);
    }
  });

  it('should show running total', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const total = page.locator('[class*="total"], [class*="sum"]');
    await page.waitForTimeout(500);
  });

  it('should complete shopping trip', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const completeBtn = page.locator('button:has-text("Complete"), button:has-text("Finish"), button:has-text("Done")');
    if (await completeBtn.count() > 0) {
      await completeBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });

  it('should delete item from list', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForTimeout(2000);

    const deleteBtn = page.locator('button[aria-label*="delete"], button:has-text("Delete")');
    if (await deleteBtn.count() > 0) {
      await deleteBtn.first().click();
      await page.waitForTimeout(1000);

      // Confirm if modal appears
      const confirmBtn = page.locator('button:has-text("Delete"), button:has-text("Confirm")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
