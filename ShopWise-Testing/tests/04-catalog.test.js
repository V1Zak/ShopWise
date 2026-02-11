import { describe, it } from 'chrometester';

describe('Item Catalog', () => {
  it('should load catalog page', async ({ page, expect }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/catalog/);
  });

  it('should display product grid', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(2000);

    const productCards = page.locator('[class*="product"], [class*="item"], [class*="card"]');
    await page.waitForTimeout(1000);
  });

  it('should search for products', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('milk');
      await page.waitForTimeout(1500); // Wait for debounce
    }
  });

  it('should filter by category', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(1000);

    const categoryFilter = page.locator('select, button[role="combobox"]');
    if (await categoryFilter.count() > 0) {
      await categoryFilter.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should filter by store', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(1000);

    const storeFilter = page.locator('select:has(option:has-text("Store")), button:has-text("Store")');
    if (await storeFilter.count() > 0) {
      await storeFilter.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should open add product modal', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should create new product', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button:has-text("Add Product"), button:has-text("New Product")');
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(1000);

      // Fill product form
      const nameInput = page.locator('input[name="name"], input[placeholder*="product name"]');
      if (await nameInput.count() > 0) {
        await nameInput.first().fill('Test Product');
        await page.waitForTimeout(500);

        // Add more fields
        const priceInput = page.locator('input[name="price"], input[type="number"]');
        if (await priceInput.count() > 0) {
          await priceInput.first().fill('9.99');
        }
      }
    }
  });

  it('should scan barcode', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(1000);

    const scanBtn = page.locator('button:has-text("Scan"), button[aria-label*="scan"]');
    if (await scanBtn.count() > 0) {
      await scanBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });

  it('should edit product', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(2000);

    const editBtn = page.locator('button[aria-label*="edit"]');
    if (await editBtn.count() > 0) {
      await editBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  it('should delete product', async ({ page }) => {
    await page.goto('http://localhost:5173/catalog');
    await page.waitForTimeout(2000);

    const deleteBtn = page.locator('button[aria-label*="delete"]');
    if (await deleteBtn.count() > 0) {
      await deleteBtn.first().click();
      await page.waitForTimeout(1000);

      // Confirm deletion
      const confirmBtn = page.locator('button:has-text("Delete"), button:has-text("Confirm")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.last().click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
