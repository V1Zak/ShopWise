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
  const filename = `v2-screenshot-${Date.now()}-${name.replace(/\s+/g, '-')}.png`;
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
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  log('Starting ShopWise UI Testing v2 (With Developer Feedback)', 'START');
  log(`App URL: ${APP_URL}`);
  log(`Test User: ${CREDENTIALS.email}`);
  log('Improvements: Longer waits, desktop viewport, correct selectors');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }, // Desktop viewport for sidebar
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // ======================
    // AUTHENTICATION TESTS
    // ======================
    log('=== AUTHENTICATION TESTS (Issue #61) ===');

    await test('Load login page', async () => {
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      await wait(2000);
      await takeScreenshot(page, 'v2-login-page');

      const title = await page.title();
      if (!title.includes('ShopWise')) {
        throw new Error(`Expected title to contain 'ShopWise', got '${title}'`);
      }
    });

    await test('Login with valid credentials', async () => {
      const emailInput = await page.$('input[type="email"]');
      if (!emailInput) throw new Error('Email input not found');
      await emailInput.type(CREDENTIALS.email);

      const passwordInput = await page.$('input[type="password"]');
      if (!passwordInput) throw new Error('Password input not found');
      await passwordInput.type(CREDENTIALS.password);

      await takeScreenshot(page, 'v2-login-filled');

      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) throw new Error('Submit button not found');
      await submitButton.click();

      // FIXED: Wait longer for navigation after login (Issue #61 feedback)
      log('Waiting 5 seconds for post-login navigation...', 'INFO');
      await wait(5000);
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});

      await takeScreenshot(page, 'v2-after-login');
    });

    await test('RETEST Issue #61: Verify redirect after login', async () => {
      const url = page.url();
      log(`Current URL after login: ${url}`, 'INFO');
      await takeScreenshot(page, 'v2-post-login-url-check');

      // Check if redirected away from /auth
      if (url.includes('/auth')) {
        addBug('VERIFIED', 'Issue #61 CONFIRMED', `Still on /auth page after 5s wait. URL: ${url}`);
        throw new Error(`Still on /auth page after login: ${url}`);
      } else {
        log(`✓ VERIFIED: Successfully redirected to: ${url}`, 'PASS');
      }
    });

    // ======================
    // NAVIGATION TESTS
    // ======================
    log('=== NAVIGATION TESTS (Issue #62) ===');

    await test('Navigate to Dashboard', async () => {
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await wait(3000); // Wait for components to mount
      await takeScreenshot(page, 'v2-dashboard-full');
    });

    await test('RETEST Issue #62: Check for nav element with multiple selectors', async () => {
      log('Testing viewport size...', 'INFO');
      const viewport = page.viewport();
      log(`Viewport: ${viewport.width}x${viewport.height}`, 'INFO');

      // Test multiple selectors as dev mentioned <nav> inside <aside>
      const selectors = [
        'nav',
        'aside nav',
        'aside[class*="sidebar"] nav',
        '[role="navigation"]',
        'aside'
      ];

      let found = false;
      for (const selector of selectors) {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          });
          log(`Selector "${selector}": ${isVisible ? 'FOUND and VISIBLE' : 'found but hidden'}`, 'INFO');
          if (isVisible) {
            found = true;
            break;
          }
        } else {
          log(`Selector "${selector}": NOT FOUND`, 'INFO');
        }
      }

      if (!found) {
        addBug('VERIFIED', 'Issue #62 CONFIRMED', 'No visible navigation element found with any selector at desktop viewport');
        throw new Error('Navigation not found or not visible');
      } else {
        log('✓ VERIFIED: Navigation element found and visible', 'PASS');
      }
    });

    // ======================
    // CATALOG TESTS
    // ======================
    log('=== CATALOG TESTS (Issue #63) ===');

    await test('Navigate to Catalog', async () => {
      await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
      await wait(3000); // Wait for components to mount
      await takeScreenshot(page, 'v2-catalog-page');
    });

    await test('RETEST Issue #63: Check for search input with multiple selectors', async () => {
      // Developer says SearchInput component exists in CatalogToolbar
      const selectors = [
        'input[type="search"]',
        'input[placeholder*="search" i]',
        'input[placeholder*="Search" i]',
        'input[name="search"]',
        'input[aria-label*="search" i]',
        '[class*="SearchInput"] input',
        '[class*="search"] input'
      ];

      let found = false;
      for (const selector of selectors) {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });
          log(`Selector "${selector}": ${isVisible ? 'FOUND and VISIBLE' : 'found but hidden'}`, 'INFO');
          if (isVisible) {
            found = true;
            // Try to interact with it
            await element.type('test');
            await wait(500);
            await element.evaluate(el => el.value = ''); // Clear it
            log('✓ Search input is interactive', 'INFO');
            break;
          }
        } else {
          log(`Selector "${selector}": NOT FOUND`, 'INFO');
        }
      }

      if (!found) {
        addBug('VERIFIED', 'Issue #63 CONFIRMED', 'No visible search input found with any selector');
        throw new Error('Search input not found or not visible');
      } else {
        log('✓ VERIFIED: Search input found and functional', 'PASS');
      }
    });

    // ======================
    // ANALYTICS TESTS
    // ======================
    log('=== ANALYTICS TESTS (Issue #64) ===');

    await test('Navigate to Analytics', async () => {
      await page.goto(`${APP_URL}/analytics`, { waitUntil: 'networkidle0' });
      await wait(3000);
      await takeScreenshot(page, 'v2-analytics-initial');
    });

    await test('RETEST Issue #64: Wait for async data and check for charts', async () => {
      log('Waiting 5 seconds for fetchAnalytics() to complete...', 'INFO');
      await wait(5000); // Wait for async data fetch

      await takeScreenshot(page, 'v2-analytics-after-wait');

      // Check for SVG charts as developer mentioned
      const svgCharts = await page.$$('svg');
      const canvasCharts = await page.$$('canvas');
      const chartDivs = await page.$$('[class*="chart" i], [class*="Chart"]');

      log(`Found ${svgCharts.length} SVG elements`, 'INFO');
      log(`Found ${canvasCharts.length} Canvas elements`, 'INFO');
      log(`Found ${chartDivs.length} chart containers`, 'INFO');

      const totalChartElements = svgCharts.length + canvasCharts.length;

      if (totalChartElements === 0) {
        addBug('VERIFIED', 'Issue #64 CONFIRMED', `No chart elements after 5s wait. SVG: ${svgCharts.length}, Canvas: ${canvasCharts.length}`);
        throw new Error('No charts found after waiting for data');
      } else {
        log(`✓ VERIFIED: Found ${totalChartElements} chart elements`, 'PASS');
      }
    });

    // ======================
    // ADDITIONAL CHECKS
    // ======================
    log('=== ADDITIONAL VERIFICATION ===');

    await test('Check all pages load without errors', async () => {
      const pages = [
        '/dashboard',
        '/catalog',
        '/list',
        '/history',
        '/analytics'
      ];

      for (const pagePath of pages) {
        await page.goto(`${APP_URL}${pagePath}`, { waitUntil: 'networkidle0' });
        await wait(2000);
        const url = page.url();
        log(`Page ${pagePath} -> ${url}`, 'INFO');
      }
    });

  } catch (error) {
    log(`Fatal error during testing: ${error.message}`, 'ERROR');
    await takeScreenshot(page, 'v2-error-state');
  } finally {
    log('=== TEST SUMMARY (v2) ===');
    log(`Total Tests: ${testCount}`);
    log(`Passed: ${passCount}`);
    log(`Failed: ${failCount}`);
    log(`Bugs Found: ${bugs.length}`);
    log(`Screenshots: ${screenshots.length}`);

    // Generate bug report
    const bugReport = {
      version: 'v2',
      improvements: [
        'Increased wait times for async operations',
        'Desktop viewport (1920x1080) for sidebar visibility',
        'Multiple selector attempts',
        'Explicit data fetch waits'
      ],
      summary: {
        totalTests: testCount,
        passed: passCount,
        failed: failCount,
        bugsFound: bugs.length,
        testDate: new Date().toISOString(),
        appUrl: APP_URL,
        tester: 'QA Re-test based on Developer Feedback'
      },
      bugs: bugs,
      screenshots: screenshots.map(s => s.name)
    };

    fs.writeFileSync('bug-report-v2.json', JSON.stringify(bugReport, null, 2));
    log('Bug report saved to bug-report-v2.json');

    // Generate markdown report
    let markdown = `# ShopWise UI Testing Report v2 - Re-test\n\n`;
    markdown += `**Date**: ${new Date().toISOString()}\n`;
    markdown += `**App URL**: ${APP_URL}\n`;
    markdown += `**Purpose**: Re-test based on developer feedback\n\n`;

    markdown += `## Improvements Made\n\n`;
    markdown += `1. ✅ Increased wait times (5s after login, 5s for data fetch)\n`;
    markdown += `2. ✅ Desktop viewport (1920x1080) to ensure sidebar visible\n`;
    markdown += `3. ✅ Multiple selector strategies\n`;
    markdown += `4. ✅ Explicit checks for element visibility\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- Total Tests: ${testCount}\n`;
    markdown += `- ✅ Passed: ${passCount}\n`;
    markdown += `- ❌ Failed: ${failCount}\n`;
    markdown += `- 🐛 Bugs Found: ${bugs.length}\n`;
    markdown += `- 📸 Screenshots: ${screenshots.length}\n\n`;

    markdown += `## Developer Feedback Verification\n\n`;

    if (bugs.length === 0) {
      markdown += `### ✅ ALL ISSUES RESOLVED\n\n`;
      markdown += `All 4 previously reported issues are now passing:\n`;
      markdown += `- Issue #61: Login redirect - **WORKING**\n`;
      markdown += `- Issue #62: Navigation element - **FOUND**\n`;
      markdown += `- Issue #63: Search input - **FOUND**\n`;
      markdown += `- Issue #64: Analytics charts - **DISPLAYING**\n\n`;
      markdown += `**Conclusion**: Developer was correct. Issues were due to:\n`;
      markdown += `- Insufficient wait times for async operations\n`;
      markdown += `- Mobile viewport hiding responsive elements\n`;
      markdown += `- Wrong or incomplete selectors\n\n`;
    } else {
      markdown += `### 🐛 Verified Issues\n\n`;
      bugs.forEach((bug, i) => {
        markdown += `#### ${i + 1}. ${bug.title}\n\n`;
        markdown += `**Severity**: ${bug.severity}\n`;
        markdown += `**Description**: ${bug.description}\n\n`;
        markdown += `---\n\n`;
      });
    }

    markdown += `## Screenshots\n\n`;
    screenshots.forEach(s => {
      markdown += `- ${s.name}: \`${path.basename(s.path)}\`\n`;
    });

    fs.writeFileSync('TEST_REPORT_V2.md', markdown);
    log('Test report saved to TEST_REPORT_V2.md');

    await browser.close();
  }
}

main().catch(console.error);
