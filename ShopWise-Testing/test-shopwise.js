import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const APP_URL = 'http://localhost:5173';
const CREDENTIALS = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

const bugs = [];
const screenshots = [];
let testCount = 0;
let passCount = 0;
let failCount = 0;

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

function addBug(severity, title, description, screenshot = null) {
  bugs.push({ severity, title, description, screenshot, timestamp: new Date().toISOString() });
  log(`BUG FOUND (${severity}): ${title}`, 'BUG');
}

async function takeScreenshot(page, name) {
  const filename = `screenshot-${Date.now()}-${name.replace(/\s+/g, '-')}.png`;
  const filepath = path.join(process.cwd(), 'screenshots', filename);
  await page.screenshot({ path: filepath, fullPage: true });
  screenshots.push({ name, path: filepath });
  log(`Screenshot saved: ${filename}`);
  return filename;
}

async function test(name, fn) {
  testCount++;
  log(`Running test: ${name}`, 'TEST');
  try {
    await fn();
    passCount++;
    log(`✓ PASS: ${name}`, 'PASS');
    return true;
  } catch (error) {
    failCount++;
    log(`✗ FAIL: ${name} - ${error.message}`, 'FAIL');
    return false;
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Create screenshots directory
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }
  if (!fs.existsSync('recordings')) {
    fs.mkdirSync('recordings');
  }

  log('Starting ShopWise UI Testing', 'START');
  log(`App URL: ${APP_URL}`);
  log(`Test User: ${CREDENTIALS.email}`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // ======================
    // AUTHENTICATION TESTS
    // ======================
    log('=== AUTHENTICATION TESTS ===');

    await test('Load login page', async () => {
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await wait(1000);
      await takeScreenshot(page, 'login-page');

      const title = await page.title();
      if (!title.includes('ShopWise')) {
        throw new Error(`Expected title to contain 'ShopWise', got '${title}'`);
      }
    });

    await test('Login with valid credentials', async () => {
      // Find and fill email
      const emailInput = await page.$('input[type="email"]');
      if (!emailInput) {
        addBug('CRITICAL', 'Email input not found', 'No email input field found on login page');
        throw new Error('Email input not found');
      }
      await emailInput.type(CREDENTIALS.email);

      // Find and fill password
      const passwordInput = await page.$('input[type="password"]');
      if (!passwordInput) {
        addBug('CRITICAL', 'Password input not found', 'No password input field found on login page');
        throw new Error('Password input not found');
      }
      await passwordInput.type(CREDENTIALS.password);

      await takeScreenshot(page, 'login-filled');

      // Submit form
      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) {
        addBug('CRITICAL', 'Submit button not found', 'No submit button found on login form');
        throw new Error('Submit button not found');
      }
      await submitButton.click();

      await wait(3000); // Wait for navigation
      await takeScreenshot(page, 'after-login');
    });

    // ======================
    // DASHBOARD TESTS
    // ======================
    log('=== DASHBOARD TESTS ===');

    await test('Dashboard loads after login', async () => {
      const url = page.url();
      await takeScreenshot(page, 'dashboard');

      if (!url.includes('/dashboard') && !url.includes('/list') && !url.includes('/catalog')) {
        addBug('MAJOR', 'Not redirected after login', `After login, URL is: ${url}`);
        throw new Error(`Expected to be redirected to dashboard, got ${url}`);
      }
    });

    await test('Navigate to Dashboard', async () => {
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await takeScreenshot(page, 'dashboard-main');
    });

    await test('Dashboard displays navigation', async () => {
      const nav = await page.$('nav, aside, [role="navigation"]');
      if (!nav) {
        addBug('MAJOR', 'Navigation not found', 'No navigation element found on dashboard');
        throw new Error('Navigation not found');
      }
    });

    // ======================
    // CATALOG TESTS
    // ======================
    log('=== CATALOG TESTS ===');

    await test('Navigate to Catalog', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await takeScreenshot(page, 'catalog-page');

      const url = page.url();
      if (!url.includes('/catalog')) {
        throw new Error(`Expected catalog URL, got ${url}`);
      }
    });

    await test('Catalog displays products', async () => {
      const products = await page.$$('[class*="product"], [class*="item"], [class*="card"]');
      log(`Found ${products.length} product cards`);

      if (products.length === 0) {
        addBug('MINOR', 'No products displayed', 'Catalog page shows no product cards');
      }
    });

    await test('Search products', async () => {
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]');
      if (searchInput) {
        await searchInput.type('milk');
        await wait(2000); // Wait for debounce
        await takeScreenshot(page, 'catalog-search-milk');
      } else {
        addBug('MINOR', 'Search input not found', 'No search input found in catalog');
      }
    });

    // ======================
    // SHOPPING LIST TESTS
    // ======================
    log('=== SHOPPING LIST TESTS ===');

    await test('Navigate to Shopping List', async () => {
      await page.goto(`${APP_URL}/list`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await takeScreenshot(page, 'shopping-list');
    });

    // ======================
    // HISTORY TESTS
    // ======================
    log('=== HISTORY TESTS ===');

    await test('Navigate to History', async () => {
      await page.goto(`${APP_URL}/history`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await takeScreenshot(page, 'history-page');

      const url = page.url();
      if (!url.includes('/history')) {
        throw new Error(`Expected history URL, got ${url}`);
      }
    });

    // ======================
    // ANALYTICS TESTS
    // ======================
    log('=== ANALYTICS TESTS ===');

    await test('Navigate to Analytics', async () => {
      await page.goto(`${APP_URL}/analytics`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await takeScreenshot(page, 'analytics-page');

      const url = page.url();
      if (!url.includes('/analytics')) {
        throw new Error(`Expected analytics URL, got ${url}`);
      }
    });

    await test('Analytics displays charts', async () => {
      const charts = await page.$$('svg, canvas, [class*="chart"]');
      log(`Found ${charts.length} chart elements`);

      if (charts.length === 0) {
        addBug('MINOR', 'No charts displayed', 'Analytics page shows no chart elements');
      }
    });

  } catch (error) {
    log(`Fatal error during testing: ${error.message}`, 'ERROR');
    await takeScreenshot(page, 'error-state');
  } finally {
    log('=== TEST SUMMARY ===');
    log(`Total Tests: ${testCount}`);
    log(`Passed: ${passCount}`);
    log(`Failed: ${failCount}`);
    log(`Bugs Found: ${bugs.length}`);
    log(`Screenshots: ${screenshots.length}`);

    // Generate bug report
    const bugReport = {
      summary: {
        totalTests: testCount,
        passed: passCount,
        failed: failCount,
        bugsFound: bugs.length,
        testDate: new Date().toISOString(),
        appUrl: APP_URL,
        tester: 'Claude Code + Puppeteer'
      },
      bugs: bugs,
      screenshots: screenshots.map(s => s.name)
    };

    fs.writeFileSync('bug-report.json', JSON.stringify(bugReport, null, 2));
    log('Bug report saved to bug-report.json');

    // Generate markdown report
    let markdown = `# ShopWise UI Testing Report\n\n`;
    markdown += `**Date**: ${new Date().toISOString()}\n`;
    markdown += `**App URL**: ${APP_URL}\n`;
    markdown += `**Tester**: Claude Code + Puppeteer\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- Total Tests: ${testCount}\n`;
    markdown += `- ✅ Passed: ${passCount}\n`;
    markdown += `- ❌ Failed: ${failCount}\n`;
    markdown += `- 🐛 Bugs Found: ${bugs.length}\n`;
    markdown += `- 📸 Screenshots: ${screenshots.length}\n\n`;

    if (bugs.length > 0) {
      markdown += `## Bugs Found\n\n`;
      bugs.forEach((bug, i) => {
        markdown += `### ${i + 1}. [${bug.severity}] ${bug.title}\n\n`;
        markdown += `**Description**: ${bug.description}\n\n`;
        if (bug.screenshot) {
          markdown += `**Screenshot**: ${bug.screenshot}\n\n`;
        }
        markdown += `---\n\n`;
      });
    }

    markdown += `## Screenshots\n\n`;
    screenshots.forEach(s => {
      markdown += `- ${s.name}: \`${path.basename(s.path)}\`\n`;
    });

    fs.writeFileSync('TEST_REPORT.md', markdown);
    log('Test report saved to TEST_REPORT.md');

    await browser.close();
  }
}

main().catch(console.error);
