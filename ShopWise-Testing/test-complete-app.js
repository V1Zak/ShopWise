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
const bugs = [];
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
  const filename = `complete-${name.replace(/\s+/g, '-')}.png`;
  const filepath = path.join(process.cwd(), 'screenshots', filename);
  await page.screenshot({ path: filepath, fullPage: true });
  screenshots.push({ name, filename, path: filepath });
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

async function addBug(severity, title, description, evidence = []) {
  bugs.push({ severity, title, description, evidence, timestamp: new Date().toISOString() });
  log(`BUG FOUND [${severity}]: ${title}`, 'BUG');
}

async function checkElement(page, selector, name) {
  const element = await page.$(selector);
  if (element) {
    const isVisible = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' &&
             style.visibility !== 'hidden' &&
             style.opacity !== '0' &&
             rect.width > 0 &&
             rect.height > 0;
    });
    log(`  ${name}: ${isVisible ? '✓ FOUND & VISIBLE' : '⚠ found but hidden'}`);
    return isVisible;
  } else {
    log(`  ${name}: ✗ NOT FOUND`);
    return false;
  }
}

async function getElementText(page, selector) {
  const element = await page.$(selector);
  if (element) {
    return await page.evaluate(el => el.textContent.trim(), element);
  }
  return null;
}

async function main() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  log('═══════════════════════════════════════════════════════', 'START');
  log('   SHOPWISE COMPREHENSIVE TESTING - ALL PAGES & FEATURES', 'START');
  log('═══════════════════════════════════════════════════════', 'START');
  log(`App URL: ${APP_URL}`);
  log(`Test User: ${CREDENTIALS.email}`);
  log('');

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
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 1: AUTHENTICATION', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Navigate to auth page', async () => {
      await page.goto(`${APP_URL}/auth`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await takeScreenshot(page, '01-auth-initial');
      const url = page.url();
      if (!url.includes('/auth')) throw new Error(`Expected /auth, got ${url}`);
    });

    await test('Find and click "Sign in" button', async () => {
      const buttons = await page.$$('button');
      const links = await page.$$('a');
      let found = false;

      for (const element of [...buttons, ...links]) {
        const text = await page.evaluate(el => el.textContent, element);
        if (text.includes('Sign in') && !text.includes('Continue')) {
          log(`  Found: "${text.trim()}"`);
          await element.click();
          found = true;
          break;
        }
      }

      if (!found) throw new Error('Sign in button not found');
      await wait(2000);
      await takeScreenshot(page, '02-signin-form');
    });

    await test('Fill credentials and login', async () => {
      const emailInput = await page.$('input[type="email"]');
      if (!emailInput) throw new Error('Email input not found');
      await emailInput.type(CREDENTIALS.email, { delay: 50 });

      const passwordInput = await page.$('input[type="password"]');
      if (!passwordInput) throw new Error('Password input not found');
      await passwordInput.type(CREDENTIALS.password, { delay: 50 });

      await takeScreenshot(page, '03-credentials-filled');

      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) throw new Error('Submit button not found');
      await submitButton.click();

      log('  Waiting for navigation...');
      await wait(5000);
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});

      const url = page.url();
      log(`  Final URL: ${url}`);
      await takeScreenshot(page, '04-after-login');

      if (url.includes('/auth')) {
        throw new Error('Still on /auth - authentication failed');
      }
    });

    // ============================================================
    // PHASE 2: DASHBOARD PAGE
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 2: DASHBOARD PAGE', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Navigate to Dashboard', async () => {
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '05-dashboard-full');

      const url = page.url();
      if (!url.includes('/dashboard') && !url.includes('localhost:5173/')) {
        throw new Error(`Expected dashboard, got ${url}`);
      }
    });

    await test('Check sidebar navigation', async () => {
      const nav = await checkElement(page, 'aside', 'Sidebar');
      if (!nav) throw new Error('Sidebar not found');

      const navLinks = await page.$$('aside a, aside button');
      log(`  Found ${navLinks.length} navigation items`);

      if (navLinks.length < 4) {
        throw new Error(`Expected at least 4 nav items, found ${navLinks.length}`);
      }
    });

    await test('Check top bar elements', async () => {
      await checkElement(page, 'header', 'Top bar');
      await checkElement(page, '[class*="greeting"], [class*="welcome"]', 'User greeting');
      await checkElement(page, 'button[class*="notification"], button[aria-label*="notification"]', 'Notification button');
    });

    await test('Check dashboard stats/cards', async () => {
      const cards = await page.$$('[class*="card"], [class*="stat"], article, section[class*="dashboard"]');
      log(`  Found ${cards.length} dashboard elements`);
      await takeScreenshot(page, '06-dashboard-content');
    });

    // ============================================================
    // PHASE 3: CATALOG PAGE
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 3: CATALOG PAGE', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Navigate to Catalog', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '07-catalog-full');

      const url = page.url();
      if (!url.includes('/catalog')) {
        throw new Error(`Expected /catalog, got ${url}`);
      }
    });

    await test('Check search input', async () => {
      const searchInput = await checkElement(page, 'input[type="search"], input[placeholder*="search" i]', 'Search input');
      if (!searchInput) throw new Error('Search input not found');
    });

    await test('Check category filters', async () => {
      const filterButtons = await page.$$('button[class*="category"], button[class*="filter"]');
      log(`  Found ${filterButtons.length} filter buttons`);

      if (filterButtons.length > 0) {
        const firstFilter = filterButtons[0];
        const text = await page.evaluate(el => el.textContent, firstFilter);
        log(`  First filter: "${text.trim()}"`);
      }
    });

    await test('Check store filters', async () => {
      const storeButtons = await page.$$('button:has-text("Costco"), button:has-text("Walmart"), button:has-text("Target")');
      // Puppeteer doesn't have :has-text, so let's find buttons with store names
      const buttons = await page.$$('button');
      let storeCount = 0;

      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.match(/Costco|Walmart|Target|Safeway|Whole Foods/i)) {
          storeCount++;
        }
      }

      log(`  Found ${storeCount} store filter buttons`);
    });

    await test('Check product grid/list', async () => {
      const products = await page.$$('[class*="product"], [class*="item-card"], article');
      log(`  Found ${products.length} product items`);

      if (products.length === 0) {
        throw new Error('No products found in catalog');
      }

      // Get details of first 3 products
      for (let i = 0; i < Math.min(3, products.length); i++) {
        const product = products[i];
        const text = await page.evaluate(el => el.textContent, product);
        const preview = text.substring(0, 100).replace(/\s+/g, ' ').trim();
        log(`  Product ${i + 1}: ${preview}...`);
      }
    });

    await test('Test search functionality', async () => {
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]');
      if (!searchInput) throw new Error('Search input not found');

      await searchInput.click();
      await searchInput.type('milk', { delay: 100 });
      await wait(1000); // Wait for debounce/filter

      await takeScreenshot(page, '08-catalog-search-milk');

      // Clear search
      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await wait(500);
    });

    await test('Check view toggle (Grid/List)', async () => {
      const viewButtons = await page.$$('button[class*="grid"], button[class*="list"], button[aria-label*="view"]');
      log(`  Found ${viewButtons.length} view toggle buttons`);

      if (viewButtons.length >= 2) {
        log('  Clicking view toggle...');
        await viewButtons[1].click();
        await wait(1000);
        await takeScreenshot(page, '09-catalog-list-view');

        // Toggle back
        await viewButtons[0].click();
        await wait(1000);
      }
    });

    await test('Check sort options', async () => {
      const sortButton = await page.$('button[class*="sort"], select[class*="sort"]');
      if (sortButton) {
        log('  Sort control found');
      } else {
        log('  Sort control not found (may be dropdown)');
      }
    });

    // ============================================================
    // PHASE 4: ACTIVE SHOPPING LIST
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 4: ACTIVE SHOPPING LIST', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Navigate to Shopping List', async () => {
      await page.goto(`${APP_URL}/list`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '10-shopping-list');

      const url = page.url();
      if (!url.includes('/list')) {
        throw new Error(`Expected /list, got ${url}`);
      }
    });

    await test('Check list items display', async () => {
      const listItems = await page.$$('[class*="list-item"], [class*="item-row"], li');
      log(`  Found ${listItems.length} list items`);

      if (listItems.length > 0) {
        const firstItem = listItems[0];
        const text = await page.evaluate(el => el.textContent, firstItem);
        log(`  First item: ${text.substring(0, 80).replace(/\s+/g, ' ')}...`);
      }
    });

    await test('Check running total', async () => {
      const totalElements = await page.$$('[class*="total"], [class*="price-total"], [class*="sum"]');
      log(`  Found ${totalElements.length} elements that might be totals`);

      for (const el of totalElements) {
        const text = await page.evaluate(elem => elem.textContent, el);
        if (text.match(/\$\d+/)) {
          log(`  Possible total: ${text.trim()}`);
        }
      }
    });

    await test('Check add item button', async () => {
      const addButtons = await page.$$('button[class*="add"], button:has-text("Add")');
      let foundAdd = false;

      for (const btn of addButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.toLowerCase().includes('add')) {
          log(`  Add button found: "${text.trim()}"`);
          foundAdd = true;
          break;
        }
      }

      if (!foundAdd) {
        log('  ⚠ Add item button not clearly identified');
      }
    });

    // ============================================================
    // PHASE 5: HISTORY PAGE
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 5: HISTORY PAGE', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Navigate to History', async () => {
      await page.goto(`${APP_URL}/history`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '11-history-full');

      const url = page.url();
      if (!url.includes('/history')) {
        throw new Error(`Expected /history, got ${url}`);
      }
    });

    await test('Check history list/trips', async () => {
      const historyItems = await page.$$('[class*="trip"], [class*="history-item"], article, [class*="card"]');
      log(`  Found ${historyItems.length} history items/cards`);

      if (historyItems.length > 0) {
        for (let i = 0; i < Math.min(3, historyItems.length); i++) {
          const item = historyItems[i];
          const text = await page.evaluate(el => el.textContent, item);
          const preview = text.substring(0, 100).replace(/\s+/g, ' ').trim();
          log(`  History ${i + 1}: ${preview}...`);
        }
      } else {
        log('  No history items found (may be empty)');
      }
    });

    await test('Check date/filter controls', async () => {
      const dateInputs = await page.$$('input[type="date"], input[type="month"]');
      const filterButtons = await page.$$('button[class*="filter"]');
      log(`  Found ${dateInputs.length} date inputs, ${filterButtons.length} filter buttons`);
    });

    // ============================================================
    // PHASE 6: ANALYTICS PAGE
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 6: ANALYTICS PAGE', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Navigate to Analytics', async () => {
      await page.goto(`${APP_URL}/analytics`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '12-analytics-initial');

      const url = page.url();
      if (!url.includes('/analytics')) {
        throw new Error(`Expected /analytics, got ${url}`);
      }
    });

    await test('Wait for analytics data to load', async () => {
      log('  Waiting 5 seconds for data fetch...');
      await wait(5000);
      await takeScreenshot(page, '13-analytics-loaded');
    });

    await test('Check for charts/graphs', async () => {
      const svgElements = await page.$$('svg');
      const canvasElements = await page.$$('canvas');
      const chartContainers = await page.$$('[class*="chart"], [class*="graph"]');

      log(`  SVG elements: ${svgElements.length}`);
      log(`  Canvas elements: ${canvasElements.length}`);
      log(`  Chart containers: ${chartContainers.length}`);

      const totalCharts = svgElements.length + canvasElements.length;

      if (totalCharts === 0 && chartContainers.length === 0) {
        log('  ⚠ No chart elements found - may need data');
      } else {
        log(`  ✓ Found ${totalCharts} chart elements`);
      }
    });

    await test('Check analytics stats/KPIs', async () => {
      const statElements = await page.$$('[class*="stat"], [class*="kpi"], [class*="metric"]');
      log(`  Found ${statElements.length} stat/metric elements`);

      // Look for dollar amounts
      const pageText = await page.evaluate(() => document.body.innerText);
      const dollarMatches = pageText.match(/\$[\d,]+\.?\d*/g) || [];
      log(`  Found ${dollarMatches.length} dollar amounts on page`);
      if (dollarMatches.length > 0) {
        log(`  Examples: ${dollarMatches.slice(0, 3).join(', ')}`);
      }
    });

    // ============================================================
    // PHASE 7: SETTINGS PAGE
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 7: SETTINGS PAGE', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Navigate to Settings', async () => {
      await page.goto(`${APP_URL}/settings`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, '14-settings-full');

      const url = page.url();
      if (!url.includes('/settings')) {
        throw new Error(`Expected /settings, got ${url}`);
      }
    });

    await test('Check settings sections', async () => {
      const sections = await page.$$('section, [class*="setting-group"]');
      log(`  Found ${sections.length} settings sections`);

      const headings = await page.$$('h2, h3, [class*="heading"]');
      log(`  Found ${headings.length} headings`);

      for (let i = 0; i < Math.min(5, headings.length); i++) {
        const text = await page.evaluate(el => el.textContent, headings[i]);
        log(`  Section: ${text.trim()}`);
      }
    });

    await test('Check profile/account info', async () => {
      const email = await page.$('[class*="email"], input[type="email"]');
      const avatar = await page.$('[class*="avatar"], img[alt*="profile"]');

      if (email) log('  ✓ Email field found');
      if (avatar) log('  ✓ Avatar/profile image found');
    });

    // ============================================================
    // PHASE 8: RESPONSIVE BEHAVIOR
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 8: RESPONSIVE BEHAVIOR', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Test mobile viewport (375x667)', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await wait(1000);
      await takeScreenshot(page, '15-mobile-dashboard');

      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await takeScreenshot(page, '16-mobile-catalog');

      // Check for bottom navigation (mobile)
      const bottomNav = await page.$('[class*="bottom-nav"], nav[class*="mobile"]');
      if (bottomNav) {
        log('  ✓ Mobile bottom navigation found');
      } else {
        log('  ⚠ Mobile bottom navigation not clearly identified');
      }
    });

    await test('Test tablet viewport (768x1024)', async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await wait(1000);
      await takeScreenshot(page, '17-tablet-view');
    });

    await test('Restore desktop viewport', async () => {
      await page.setViewport({ width: 1920, height: 1080 });
      await wait(1000);
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await wait(2000);
    });

    // ============================================================
    // PHASE 9: USER FLOWS
    // ============================================================
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');
    log('PHASE 9: USER FLOWS', 'PHASE');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'PHASE');

    await test('Flow: Browse catalog → View product details', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(2000);

      const products = await page.$$('[class*="product"], article');
      if (products.length > 0) {
        log('  Clicking first product...');
        await products[0].click();
        await wait(2000);
        await takeScreenshot(page, '18-product-details');
      } else {
        log('  ⚠ No products to click');
      }
    });

    await test('Check page navigation flow', async () => {
      const pages = ['/dashboard', '/catalog', '/list', '/history', '/analytics'];

      for (const pagePath of pages) {
        await page.goto(`${APP_URL}${pagePath}`, { waitUntil: 'networkidle0' });
        await wait(1000);
        const url = page.url();

        if (url.includes('/auth')) {
          throw new Error(`${pagePath} redirected to /auth - session lost`);
        }

        log(`  ✓ ${pagePath} accessible`);
      }
    });

    // ============================================================
    // FINAL SUMMARY
    // ============================================================
    log('');
    log('═══════════════════════════════════════════════════════', 'COMPLETE');
    log('   TESTING COMPLETE', 'COMPLETE');
    log('═══════════════════════════════════════════════════════', 'COMPLETE');

  } catch (error) {
    log(`FATAL ERROR: ${error.message}`, 'ERROR');
    await takeScreenshot(page, 'error-state');
  } finally {
    // Generate report
    log('');
    log('────────────────────────────────────────────────────────');
    log('TEST SUMMARY');
    log('────────────────────────────────────────────────────────');
    log(`Total Tests: ${testCount}`);
    log(`✓ Passed: ${passCount} (${Math.round(passCount/testCount*100)}%)`);
    log(`✗ Failed: ${failCount} (${Math.round(failCount/testCount*100)}%)`);
    log(`🐛 Bugs Found: ${bugs.length}`);
    log(`📸 Screenshots: ${screenshots.length}`);
    log('────────────────────────────────────────────────────────');

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      app_url: APP_URL,
      test_user: CREDENTIALS.email,
      summary: {
        total_tests: testCount,
        passed: passCount,
        failed: failCount,
        pass_rate: `${Math.round(passCount/testCount*100)}%`,
        bugs_found: bugs.length,
        screenshots_captured: screenshots.length
      },
      test_results: testResults,
      bugs: bugs,
      screenshots: screenshots.map(s => ({ name: s.name, file: s.filename }))
    };

    fs.writeFileSync('COMPLETE_TEST_REPORT.json', JSON.stringify(report, null, 2));
    log('Detailed report saved to COMPLETE_TEST_REPORT.json');

    // Generate markdown report
    let markdown = `# ShopWise Complete Application Test Report\n\n`;
    markdown += `**Date**: ${new Date().toISOString()}\n`;
    markdown += `**App URL**: ${APP_URL}\n`;
    markdown += `**Test User**: ${CREDENTIALS.email}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- **Total Tests**: ${testCount}\n`;
    markdown += `- **✓ Passed**: ${passCount} (${Math.round(passCount/testCount*100)}%)\n`;
    markdown += `- **✗ Failed**: ${failCount} (${Math.round(failCount/testCount*100)}%)\n`;
    markdown += `- **🐛 Bugs Found**: ${bugs.length}\n`;
    markdown += `- **📸 Screenshots**: ${screenshots.length}\n\n`;

    markdown += `## Test Results by Phase\n\n`;
    testResults.forEach((result, i) => {
      const icon = result.status === 'PASS' ? '✓' : '✗';
      markdown += `${i + 1}. ${icon} **${result.name}**`;
      if (result.error) {
        markdown += ` - _${result.error}_`;
      }
      markdown += `\n`;
    });

    if (bugs.length > 0) {
      markdown += `\n## Bugs Found\n\n`;
      bugs.forEach((bug, i) => {
        markdown += `### ${i + 1}. [${bug.severity}] ${bug.title}\n\n`;
        markdown += `${bug.description}\n\n`;
        if (bug.evidence.length > 0) {
          markdown += `**Evidence**: ${bug.evidence.join(', ')}\n\n`;
        }
        markdown += `---\n\n`;
      });
    }

    markdown += `\n## Screenshots\n\n`;
    screenshots.forEach(s => {
      markdown += `- **${s.name}**: \`${s.filename}\`\n`;
    });

    fs.writeFileSync('COMPLETE_TEST_REPORT.md', markdown);
    log('Markdown report saved to COMPLETE_TEST_REPORT.md');

    await wait(3000);
    await browser.close();
  }
}

main().catch(console.error);
