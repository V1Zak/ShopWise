import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const APP_URL = 'https://smartshoppinglist-sand.vercel.app';
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
  const filename = `prod-screenshot-${Date.now()}-${name.replace(/\s+/g, '-')}.png`;
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
  // Create directories
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  log('Starting ShopWise PRODUCTION Testing', 'START');
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

    await test('Load production login page', async () => {
      await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
      await wait(2000);
      await takeScreenshot(page, 'prod-login-page');

      const title = await page.title();
      log(`Page title: ${title}`);
    });

    await test('Login with valid credentials on production', async () => {
      // Find and fill email
      const emailInput = await page.$('input[type="email"]');
      if (!emailInput) {
        addBug('CRITICAL', '[PROD] Email input not found', 'No email input field found on production login page');
        throw new Error('Email input not found');
      }
      await emailInput.type(CREDENTIALS.email);

      // Find and fill password
      const passwordInput = await page.$('input[type="password"]');
      if (!passwordInput) {
        addBug('CRITICAL', '[PROD] Password input not found', 'No password input field found on production login page');
        throw new Error('Password input not found');
      }
      await passwordInput.type(CREDENTIALS.password);

      await takeScreenshot(page, 'prod-login-filled');

      // Submit form
      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) {
        addBug('CRITICAL', '[PROD] Submit button not found', 'No submit button found on production login form');
        throw new Error('Submit button not found');
      }
      await submitButton.click();

      await wait(4000); // Wait longer for production
      await takeScreenshot(page, 'prod-after-login');
    });

    // ======================
    // DASHBOARD TESTS
    // ======================
    log('=== DASHBOARD TESTS ===');

    await test('Production dashboard loads after login', async () => {
      const url = page.url();
      await takeScreenshot(page, 'prod-dashboard');
      log(`Current URL: ${url}`);

      if (!url.includes('/dashboard') && !url.includes('/list') && !url.includes('/catalog')) {
        addBug('MAJOR', '[PROD] Not redirected after login', `After login on production, URL is: ${url}`);
        throw new Error(`Expected to be redirected to dashboard, got ${url}`);
      }
    });

    await test('Navigate to production Dashboard', async () => {
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
      await wait(2000);
      await takeScreenshot(page, 'prod-dashboard-main');
    });

    await test('Production dashboard displays navigation', async () => {
      const nav = await page.$('nav, aside, [role="navigation"]');
      if (!nav) {
        addBug('MAJOR', '[PROD] Navigation not found', 'No navigation element found on production dashboard');
        throw new Error('Navigation not found');
      }
    });

    // ======================
    // CATALOG TESTS
    // ======================
    log('=== CATALOG TESTS ===');

    await test('Navigate to production Catalog', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0', timeout: 30000 });
      await wait(2000);
      await takeScreenshot(page, 'prod-catalog-page');

      const url = page.url();
      if (!url.includes('/catalog')) {
        throw new Error(`Expected catalog URL, got ${url}`);
      }
    });

    await test('Production catalog displays products', async () => {
      const products = await page.$$('[class*="product"], [class*="item"], [class*="card"]');
      log(`Found ${products.length} product cards`);

      if (products.length === 0) {
        addBug('MINOR', '[PROD] No products displayed', 'Production catalog page shows no product cards');
      }
    });

    await test('Production catalog search', async () => {
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]');
      if (searchInput) {
        await searchInput.type('milk');
        await wait(2000);
        await takeScreenshot(page, 'prod-catalog-search');
      } else {
        addBug('MINOR', '[PROD] Search input not found', 'No search input found in production catalog');
      }
    });

    // ======================
    // SHOPPING LIST TESTS
    // ======================
    log('=== SHOPPING LIST TESTS ===');

    await test('Navigate to production Shopping List', async () => {
      await page.goto(`${APP_URL}/list`, { waitUntil: 'networkidle0', timeout: 30000 });
      await wait(2000);
      await takeScreenshot(page, 'prod-shopping-list');
    });

    // ======================
    // HISTORY TESTS
    // ======================
    log('=== HISTORY TESTS ===');

    await test('Navigate to production History', async () => {
      await page.goto(`${APP_URL}/history`, { waitUntil: 'networkidle0', timeout: 30000 });
      await wait(2000);
      await takeScreenshot(page, 'prod-history-page');

      const url = page.url();
      if (!url.includes('/history')) {
        throw new Error(`Expected history URL, got ${url}`);
      }
    });

    // ======================
    // ANALYTICS TESTS
    // ======================
    log('=== ANALYTICS TESTS ===');

    await test('Navigate to production Analytics', async () => {
      await page.goto(`${APP_URL}/analytics`, { waitUntil: 'networkidle0', timeout: 30000 });
      await wait(2000);
      await takeScreenshot(page, 'prod-analytics-page');

      const url = page.url();
      if (!url.includes('/analytics')) {
        throw new Error(`Expected analytics URL, got ${url}`);
      }
    });

    await test('Production analytics displays charts', async () => {
      const charts = await page.$$('svg, canvas, [class*="chart"]');
      log(`Found ${charts.length} chart elements`);

      if (charts.length === 0) {
        addBug('MINOR', '[PROD] No charts displayed', 'Production analytics page shows no chart elements');
      }
    });

    // ======================
    // PERFORMANCE CHECK
    // ======================
    log('=== PERFORMANCE CHECK ===');

    await test('Check production page load time', async () => {
      const start = Date.now();
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
      const loadTime = Date.now() - start;
      log(`Dashboard load time: ${loadTime}ms`);

      if (loadTime > 5000) {
        addBug('MINOR', '[PROD] Slow page load', `Dashboard takes ${loadTime}ms to load (>5s)`);
      }
    });

  } catch (error) {
    log(`Fatal error during testing: ${error.message}`, 'ERROR');
    await takeScreenshot(page, 'prod-error-state');
  } finally {
    log('=== PRODUCTION TEST SUMMARY ===');
    log(`Total Tests: ${testCount}`);
    log(`Passed: ${passCount}`);
    log(`Failed: ${failCount}`);
    log(`Bugs Found: ${bugs.length}`);
    log(`Screenshots: ${screenshots.length}`);

    // Generate bug report
    const bugReport = {
      environment: 'PRODUCTION',
      url: APP_URL,
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

    fs.writeFileSync('production-bug-report.json', JSON.stringify(bugReport, null, 2));
    log('Production bug report saved to production-bug-report.json');

    // Generate markdown report
    let markdown = `# ShopWise PRODUCTION Testing Report\n\n`;
    markdown += `**Environment**: PRODUCTION\n`;
    markdown += `**URL**: ${APP_URL}\n`;
    markdown += `**Date**: ${new Date().toISOString()}\n`;
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
    } else {
      markdown += `## ✅ No Bugs Found!\n\nProduction environment is working correctly!\n\n`;
    }

    markdown += `## Screenshots\n\n`;
    screenshots.forEach(s => {
      markdown += `- ${s.name}: \`${path.basename(s.path)}\`\n`;
    });

    fs.writeFileSync('PRODUCTION_TEST_REPORT.md', markdown);
    log('Production test report saved to PRODUCTION_TEST_REPORT.md');

    await browser.close();
  }
}

main().catch(console.error);
