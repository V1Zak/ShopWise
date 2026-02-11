import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const APP_URL = 'http://localhost:5173';
const CREDENTIALS = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

const testResults = [];
const screenshots = [];
let testCount = 0;
let passCount = 0;
let failCount = 0;

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type}] ${message}`;
  console.log(logLine);
  return logLine;
}

async function takeScreenshot(page, name) {
  const filename = `product-features-${name.replace(/\s+/g, '-')}.png`;
  const filepath = path.join(process.cwd(), 'screenshots', filename);
  await page.screenshot({ path: filepath, fullPage: true });
  screenshots.push({ name, filename });
  log(`Screenshot: ${filename}`);
  return filename;
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(name, fn) {
  testCount++;
  log(`TEST ${testCount}: ${name}`, 'TEST');
  try {
    await fn();
    passCount++;
    testResults.push({ name, status: 'PASS', error: null });
    log(`✓ PASS: ${name}`, 'PASS');
    return true;
  } catch (error) {
    failCount++;
    testResults.push({ name, status: 'FAIL', error: error.message });
    log(`✗ FAIL: ${name} - ${error.message}`, 'FAIL');
    return false;
  }
}

async function clickElementWithText(page, text, elementType = '*') {
  const elements = await page.$$(elementType);
  for (const element of elements) {
    const elementText = await page.evaluate(el => el.textContent, element);
    if (elementText.toLowerCase().includes(text.toLowerCase())) {
      log(`  Found element with text: "${elementText.trim()}"`);
      await element.click();
      return true;
    }
  }
  return false;
}

async function main() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  log('═══════════════════════════════════════════════════════', 'START');
  log('   TESTING: PRODUCT IMAGES & ADD TO LIST FEATURES', 'START');
  log('═══════════════════════════════════════════════════════', 'START');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // ============================================================
    // PHASE 1: AUTHENTICATION
    // ============================================================
    log('━━━ PHASE 1: AUTHENTICATION ━━━', 'PHASE');

    await test('Login to application', async () => {
      await page.goto(`${APP_URL}/auth`, { waitUntil: 'networkidle0' });
      await wait(2000);

      // Click "Sign in" button
      const buttons = await page.$$('button, a');
      let signInClicked = false;
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Sign in') && !text.includes('Continue')) {
          await btn.click();
          signInClicked = true;
          break;
        }
      }

      if (!signInClicked) throw new Error('Sign in button not found');
      await wait(2000);

      // Fill credentials
      const emailInput = await page.$('input[type="email"]');
      if (!emailInput) throw new Error('Email input not found');
      await emailInput.type(CREDENTIALS.email, { delay: 50 });

      const passwordInput = await page.$('input[type="password"]');
      if (!passwordInput) throw new Error('Password input not found');
      await passwordInput.type(CREDENTIALS.password, { delay: 50 });

      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) throw new Error('Submit button not found');
      await submitButton.click();

      await wait(5000);
      const url = page.url();
      if (url.includes('/auth')) throw new Error('Login failed');

      log('  ✓ Logged in successfully');
    });

    // ============================================================
    // PHASE 2: PRODUCT IMAGE TESTING
    // ============================================================
    log('');
    log('━━━ PHASE 2: PRODUCT IMAGE FEATURES ━━━', 'PHASE');

    await test('Navigate to Catalog', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '01-catalog-initial');

      const url = page.url();
      if (!url.includes('/catalog')) throw new Error(`Expected /catalog, got ${url}`);
    });

    await test('Check product image display', async () => {
      // Look for images in product cards
      const images = await page.$$('img[src*="product"], img[alt*="product"], [class*="product"] img');
      log(`  Found ${images.length} product-related images`);

      // Check for image placeholders or icons
      const imageContainers = await page.$$('[class*="image"], [class*="photo"], [class*="picture"]');
      log(`  Found ${imageContainers.length} image containers`);

      // Look for specific product cards
      const pageContent = await page.evaluate(() => document.body.innerHTML);
      const hasEggsProduct = pageContent.includes('Eggs') || pageContent.includes('eggs');
      const hasMilkProduct = pageContent.includes('Milk') || pageContent.includes('milk');

      log(`  Products visible: Eggs=${hasEggsProduct}, Milk=${hasMilkProduct}`);
    });

    await test('Look for "Add Image" or "Edit Product" functionality', async () => {
      await takeScreenshot(page, '02-catalog-products');

      // Look for edit buttons or icons near products
      const editButtons = await page.$$('button[aria-label*="edit"], button[title*="edit"], [class*="edit"]');
      log(`  Found ${editButtons.length} edit-related buttons`);

      // Look for camera/image icons (Material Symbols)
      const cameraIcons = await page.evaluate(() => {
        const icons = Array.from(document.querySelectorAll('.material-symbols-outlined'));
        return icons.filter(icon =>
          icon.textContent.includes('photo') ||
          icon.textContent.includes('camera') ||
          icon.textContent.includes('image') ||
          icon.textContent.includes('add_photo')
        ).length;
      });
      log(`  Found ${cameraIcons} camera/photo icons`);

      // Try to find an "Add Product" or "New Product" button
      const allButtons = await page.$$('button');
      let addProductButton = null;
      for (const btn of allButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.toLowerCase().includes('add') || text.toLowerCase().includes('new product')) {
          log(`  Found button: "${text.trim()}"`);
          if (text.toLowerCase().includes('product')) {
            addProductButton = btn;
          }
        }
      }

      if (addProductButton) {
        log('  ✓ Found "Add/New Product" button');
      } else {
        log('  ⚠ No "Add Product" button clearly identified');
      }
    });

    await test('Try to open product details/edit', async () => {
      // Look for product cards that might be clickable
      await takeScreenshot(page, '03-before-product-click');

      // Try to find and click the first product card
      const productCards = await page.$$('[class*="card"], article, [class*="product-item"]');
      log(`  Found ${productCards.length} potential product cards`);

      if (productCards.length > 0) {
        log('  Clicking first product card...');
        await productCards[0].click();
        await wait(3000);
        await takeScreenshot(page, '04-after-product-click');

        // Check if a modal or detail view opened
        const modalOrDialog = await page.$('[role="dialog"], .modal, [class*="modal"], [class*="dialog"]');
        if (modalOrDialog) {
          log('  ✓ Modal/dialog opened');

          // Look for image upload in the modal
          const fileInput = await page.$('input[type="file"]');
          const uploadButton = await page.$('button[aria-label*="upload"], button[title*="upload"]');

          if (fileInput) {
            log('  ✓ Found file input for image upload');
          }
          if (uploadButton) {
            log('  ✓ Found upload button');
          }

          await takeScreenshot(page, '05-modal-detail-view');
        } else {
          log('  ⚠ No modal opened, might have navigated to detail page');
          const url = page.url();
          log(`  Current URL: ${url}`);
        }
      } else {
        log('  ⚠ No product cards found to click');
      }
    });

    await test('Check for image upload/edit interface', async () => {
      // Look for file input
      const fileInputs = await page.$$('input[type="file"]');
      log(`  Found ${fileInputs.length} file input(s)`);

      if (fileInputs.length > 0) {
        const fileInput = fileInputs[0];
        const acceptAttr = await page.evaluate(el => el.getAttribute('accept'), fileInput);
        log(`  File input accepts: ${acceptAttr || 'any file'}`);
      }

      // Look for image/photo related buttons
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.toLowerCase().includes('image') ||
            text.toLowerCase().includes('photo') ||
            text.toLowerCase().includes('upload') ||
            text.toLowerCase().includes('camera')) {
          log(`  Found image-related button: "${text.trim()}"`);
        }
      }

      await takeScreenshot(page, '06-upload-interface');
    });

    // ============================================================
    // PHASE 3: ADD TO LIST TESTING
    // ============================================================
    log('');
    log('━━━ PHASE 3: ADD TO LIST FEATURES ━━━', 'PHASE');

    await test('Navigate back to Catalog', async () => {
      // Close any open modals first
      const closeButtons = await page.$$('button[aria-label*="close"], button[title*="close"], button.close, .modal button');
      if (closeButtons.length > 0) {
        log('  Closing modal...');
        await closeButtons[0].click();
        await wait(1000);
      }

      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '07-catalog-for-add-to-list');
    });

    await test('Look for "Add to List" buttons', async () => {
      // Look for shopping cart icons
      const cartIcons = await page.evaluate(() => {
        const icons = Array.from(document.querySelectorAll('.material-symbols-outlined'));
        return icons.filter(icon =>
          icon.textContent.includes('shopping_cart') ||
          icon.textContent.includes('add_shopping_cart') ||
          icon.textContent.includes('add')
        ).map(icon => ({
          text: icon.textContent.trim(),
          parent: icon.parentElement?.tagName
        }));
      });

      log(`  Found ${cartIcons.length} cart/add icons`);
      cartIcons.slice(0, 5).forEach(icon => {
        log(`    - Icon: "${icon.text}" in <${icon.parent}>`);
      });

      // Look for "Add to list" text
      const pageText = await page.evaluate(() => document.body.innerText);
      const hasAddToList = pageText.toLowerCase().includes('add to list');
      const hasAddItem = pageText.toLowerCase().includes('add item');

      log(`  Text contains "add to list": ${hasAddToList}`);
      log(`  Text contains "add item": ${hasAddItem}`);

      await takeScreenshot(page, '08-add-to-list-buttons');
    });

    await test('Find and click "Add to List" on first product', async () => {
      // Try to find add buttons near products
      const addButtons = await page.$$('button[aria-label*="add"], button[title*="add"]');
      log(`  Found ${addButtons.length} buttons with "add" in aria-label/title`);

      // Try shopping cart icons that are buttons
      const cartButtons = await page.evaluate(() => {
        const icons = Array.from(document.querySelectorAll('.material-symbols-outlined'));
        const cartIcons = icons.filter(icon =>
          icon.textContent.includes('shopping_cart') ||
          icon.textContent.includes('add_shopping_cart')
        );

        // Find parent buttons
        return cartIcons.map(icon => {
          let parent = icon.parentElement;
          while (parent && parent.tagName !== 'BUTTON') {
            parent = parent.parentElement;
          }
          return parent !== null;
        }).filter(Boolean).length;
      });

      log(`  Found ${cartButtons} shopping cart buttons`);

      // Try to click the first cart button
      await page.evaluate(() => {
        const icons = Array.from(document.querySelectorAll('.material-symbols-outlined'));
        const cartIcon = icons.find(icon =>
          icon.textContent.includes('shopping_cart') ||
          icon.textContent.includes('add_shopping_cart')
        );

        if (cartIcon) {
          let parent = cartIcon.parentElement;
          while (parent && parent.tagName !== 'BUTTON') {
            parent = parent.parentElement;
          }
          if (parent && parent.tagName === 'BUTTON') {
            parent.click();
            return true;
          }
        }
        return false;
      }).then(clicked => {
        if (clicked) {
          log('  ✓ Clicked shopping cart button');
        } else {
          log('  ⚠ Could not find/click cart button');
        }
      });

      await wait(2000);
      await takeScreenshot(page, '09-after-add-click');
    });

    await test('Check for list selection modal/dropdown', async () => {
      // Look for a modal or dropdown to select which list to add to
      const modal = await page.$('[role="dialog"], .modal, [class*="modal"]');
      if (modal) {
        log('  ✓ Modal opened for list selection');
        await takeScreenshot(page, '10-list-selection-modal');

        // Look for list options
        const listOptions = await page.$$('[role="option"], .list-option, [class*="list-item"]');
        log(`  Found ${listOptions.length} list options`);

        // Look for "Create new list" option
        const pageText = await page.evaluate(() => document.body.innerText);
        const hasCreateNew = pageText.toLowerCase().includes('create') || pageText.toLowerCase().includes('new list');
        log(`  Has "Create new list" option: ${hasCreateNew}`);
      } else {
        log('  ⚠ No modal opened - checking for dropdown');

        // Check for select/dropdown
        const selects = await page.$$('select');
        log(`  Found ${selects.length} select dropdowns`);

        // Check for expanded dropdown/menu
        const dropdownMenus = await page.$$('[role="menu"], [class*="dropdown"]');
        log(`  Found ${dropdownMenus.length} dropdown menus`);
      }

      await takeScreenshot(page, '11-list-selection-interface');
    });

    await test('Check top "Add item to list" quick action', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(2000);

      // Look for the quick add at the top
      const topAddInput = await page.$('input[placeholder*="Add item"], input[placeholder*="track price"]');
      if (topAddInput) {
        log('  ✓ Found quick add input at top');

        const placeholder = await page.evaluate(el => el.placeholder, topAddInput);
        log(`  Placeholder: "${placeholder}"`);

        // Try typing in it
        await topAddInput.click();
        await topAddInput.type('Test Item', { delay: 100 });
        await wait(1000);
        await takeScreenshot(page, '12-quick-add-filled');

        // Look for "Add" button next to it
        const addButtonNext = await page.$('button[type="submit"]');
        if (addButtonNext) {
          const buttonText = await page.evaluate(el => el.textContent, addButtonNext);
          log(`  Found button next to input: "${buttonText.trim()}"`);
        }

        // Clear the input
        await topAddInput.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');
      } else {
        log('  ⚠ Quick add input not found');
      }
    });

    // ============================================================
    // PHASE 4: EXPLORE CREATE NEW PRODUCT
    // ============================================================
    log('');
    log('━━━ PHASE 4: CREATE NEW PRODUCT FLOW ━━━', 'PHASE');

    await test('Look for "Add Product" or "Create Product" button', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(3000);

      // Look for FAB (Floating Action Button)
      const fab = await page.$('[class*="fab"], button[class*="floating"]');
      if (fab) {
        log('  ✓ Found floating action button');
        await takeScreenshot(page, '13-fab-button');
      }

      // Look for menu buttons (three dots)
      const menuButtons = await page.$$('button[aria-label*="menu"], button[aria-label*="more"]');
      log(`  Found ${menuButtons.length} menu buttons`);

      // Check page for any "new" or "create" buttons
      const allButtons = await page.$$('button');
      let createButtons = [];
      for (const btn of allButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), btn);
        const fullText = `${text} ${ariaLabel || ''}`.toLowerCase();

        if (fullText.includes('create') || fullText.includes('new') || fullText.includes('add product')) {
          createButtons.push(text.trim() || ariaLabel);
          log(`  Found: "${text.trim()}" / aria-label: "${ariaLabel || 'none'}"`);
        }
      }

      log(`  Total create/new product buttons: ${createButtons.length}`);
    });

    await test('Check if clicking product opens edit form with image upload', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(3000);

      // Find first product card and look for edit button
      const productArea = await page.evaluate(() => {
        // Look for product cards
        const text = document.body.innerText;
        return {
          hasEggs: text.includes('Eggs'),
          hasMilk: text.includes('Milk'),
          hasSpinach: text.includes('Spinach')
        };
      });

      log(`  Products on page: ${JSON.stringify(productArea)}`);

      // Try to hover over a product to see if edit appears
      const firstCard = await page.$('[class*="card"], article');
      if (firstCard) {
        log('  Hovering over first product card...');
        await firstCard.hover();
        await wait(1000);
        await takeScreenshot(page, '14-product-hover');

        // Look for edit button that appears on hover
        const editButtons = await page.$$('button[aria-label*="edit"], button[title*="edit"]');
        log(`  Edit buttons visible after hover: ${editButtons.length}`);

        if (editButtons.length > 0) {
          log('  Clicking edit button...');
          await editButtons[0].click();
          await wait(2000);
          await takeScreenshot(page, '15-edit-form');
        }
      }
    });

    await test('Summary of findings', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await takeScreenshot(page, '16-catalog-final-state');

      // Comprehensive check
      const findings = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        const html = document.body.innerHTML.toLowerCase();

        return {
          hasFileInput: document.querySelectorAll('input[type="file"]').length,
          hasShoppingCart: text.includes('shopping_cart') || text.includes('add_shopping_cart'),
          hasAddToList: text.includes('add to list'),
          hasAddItem: text.includes('add item'),
          hasUpload: text.includes('upload'),
          hasCamera: text.includes('camera'),
          hasPhoto: text.includes('photo'),
          hasImage: text.includes('image'),
          hasEdit: text.includes('edit'),
          hasCreate: text.includes('create'),
          totalButtons: document.querySelectorAll('button').length,
          totalInputs: document.querySelectorAll('input').length,
          totalImages: document.querySelectorAll('img').length
        };
      });

      log('  === FINDINGS SUMMARY ===');
      Object.entries(findings).forEach(([key, value]) => {
        log(`  ${key}: ${value}`);
      });
    });

  } catch (error) {
    log(`FATAL ERROR: ${error.message}`, 'ERROR');
    await takeScreenshot(page, 'error-state');
  } finally {
    log('');
    log('────────────────────────────────────────────────────────');
    log('TEST SUMMARY');
    log('────────────────────────────────────────────────────────');
    log(`Total Tests: ${testCount}`);
    log(`✓ Passed: ${passCount} (${Math.round(passCount/testCount*100)}%)`);
    log(`✗ Failed: ${failCount} (${Math.round(failCount/testCount*100)}%)`);
    log(`📸 Screenshots: ${screenshots.length}`);
    log('────────────────────────────────────────────────────────');

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      app_url: APP_URL,
      focus: 'Product images and Add to list features',
      summary: {
        total_tests: testCount,
        passed: passCount,
        failed: failCount,
        screenshots: screenshots.length
      },
      test_results: testResults,
      screenshots: screenshots
    };

    fs.writeFileSync('PRODUCT_FEATURES_REPORT.json', JSON.stringify(report, null, 2));
    log('Report saved to PRODUCT_FEATURES_REPORT.json');

    await wait(3000);
    await browser.close();
  }
}

main().catch(console.error);
