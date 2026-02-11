import puppeteer from 'puppeteer';
import path from 'path';

const APP_URL = 'http://localhost:5173';
const CREDENTIALS = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filename = `auth-fix-${name.replace(/\s+/g, '-')}.png`;
  const filepath = path.join(process.cwd(), 'screenshots', filename);
  await page.screenshot({ path: filepath, fullPage: true });
  log(`Screenshot saved: ${filename}`);
  return filename;
}

async function main() {
  log('=== TESTING PROPER AUTHENTICATION FLOW ===');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // Step 1: Navigate to /auth page
    log('Step 1: Navigating to /auth page...');
    await page.goto(`${APP_URL}/auth`, { waitUntil: 'networkidle0' });
    await wait(2000);
    await takeScreenshot(page, '1-initial-auth-page');

    // Step 2: Look for "Already have an account? Sign in" button
    log('Step 2: Looking for "Sign in" button...');

    // Try multiple selectors for the sign in button
    const signInSelectors = [
      'button:has-text("Sign in")',
      'button:has-text("Already have an account")',
      'text=Sign in',
      'text=Already have an account',
      'a:has-text("Sign in")'
    ];

    // Puppeteer doesn't have :has-text, so let's search by text content
    const buttons = await page.$$('button');
    const links = await page.$$('a');
    const allClickables = [...buttons, ...links];

    let signInButton = null;
    for (const element of allClickables) {
      const text = await page.evaluate(el => el.textContent, element);
      log(`  Found clickable element with text: "${text.trim()}"`);
      if (text.includes('Sign in') || text.includes('Already have an account')) {
        signInButton = element;
        log(`  ✓ Found sign-in button/link: "${text.trim()}"`);
        break;
      }
    }

    if (!signInButton) {
      log('  ⚠ Sign in button not found - might already be on sign-in form');
    } else {
      // Step 3: Click the sign-in button
      log('Step 3: Clicking "Sign in" button...');
      await signInButton.click();
      await wait(2000);
      await takeScreenshot(page, '2-after-clicking-signin');
    }

    // Step 4: Fill in email
    log('Step 4: Filling in email...');
    const emailInput = await page.$('input[type="email"]');
    if (!emailInput) {
      throw new Error('Email input not found on sign-in form');
    }
    await emailInput.type(CREDENTIALS.email);
    log(`  ✓ Email filled: ${CREDENTIALS.email}`);

    // Step 5: Fill in password
    log('Step 5: Filling in password...');
    const passwordInput = await page.$('input[type="password"]');
    if (!passwordInput) {
      throw new Error('Password input not found on sign-in form');
    }
    await passwordInput.type(CREDENTIALS.password);
    log('  ✓ Password filled');

    await takeScreenshot(page, '3-credentials-filled');

    // Step 6: Submit the form
    log('Step 6: Submitting login form...');
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
    await submitButton.click();
    log('  ✓ Submit button clicked');

    // Step 7: Wait for navigation/redirect
    log('Step 7: Waiting for post-login navigation...');
    await wait(5000);
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {
      log('  Navigation timeout - checking URL anyway');
    });

    const urlAfterLogin = page.url();
    log(`  Current URL after login: ${urlAfterLogin}`);
    await takeScreenshot(page, '4-after-login');

    if (urlAfterLogin.includes('/auth')) {
      log('  ⚠ Still on /auth page - login may have failed');
    } else {
      log(`  ✓ Successfully redirected to: ${urlAfterLogin}`);
    }

    // Step 8: Navigate to catalog
    log('Step 8: Navigating to catalog page...');
    await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
    await wait(3000);
    await takeScreenshot(page, '5-catalog-page');

    const catalogUrl = page.url();
    log(`  Current URL: ${catalogUrl}`);

    if (catalogUrl.includes('/auth')) {
      log('  ⚠ Redirected back to /auth - authentication did not persist');
      throw new Error('Not authenticated - redirected to /auth');
    }

    // Step 9: Find all items on catalog page
    log('Step 9: Finding items on catalog page...');

    // Look for product cards/items
    const itemSelectors = [
      '[class*="product"]',
      '[class*="item"]',
      '[class*="card"]',
      'article',
      '[data-testid*="product"]',
      '[role="article"]'
    ];

    let items = [];
    for (const selector of itemSelectors) {
      const foundItems = await page.$$(selector);
      if (foundItems.length > 0) {
        log(`  Found ${foundItems.length} items with selector: ${selector}`);
        items = foundItems;
        break;
      }
    }

    if (items.length === 0) {
      // Try finding any visible text content
      log('  No items found with standard selectors, analyzing page content...');
      const pageText = await page.evaluate(() => document.body.innerText);
      log('  Page content preview:');
      log(pageText.substring(0, 500));
    } else {
      log(`  ✓ Found ${items.length} items on catalog page`);

      // Get details of second item (index 1)
      if (items.length >= 2) {
        log('Step 10: Getting details of second item...');
        const secondItem = items[1];
        const itemText = await page.evaluate(el => el.textContent, secondItem);
        const itemHTML = await page.evaluate(el => el.outerHTML.substring(0, 300), secondItem);

        log('  ===== SECOND ITEM DETAILS =====');
        log(`  Text content: ${itemText.trim()}`);
        log(`  HTML preview: ${itemHTML}...`);
        log('  ==============================');
      } else {
        log(`  ⚠ Only found ${items.length} item(s), cannot get second item`);
      }
    }

    await takeScreenshot(page, '6-catalog-final');

    log('\n=== TEST COMPLETE ===');

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    await takeScreenshot(page, 'error-state');
    throw error;
  } finally {
    await wait(3000); // Keep browser open for observation
    await browser.close();
  }
}

main().catch(console.error);
