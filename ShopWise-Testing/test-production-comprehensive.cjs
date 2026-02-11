const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_USER = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

const BASE_URL = 'https://smartshoppinglist-sand.vercel.app';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Test results storage
const results = {
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    duration: 0,
    timestamp: new Date().toISOString()
  },
  tests: [],
  siteMap: {
    pages: []
  },
  visualRegression: {
    screenshots: []
  },
  performance: {
    loadTimes: {}
  },
  errors: []
};

function logTest(name, status, duration, details = '') {
  results.tests.push({ name, status, duration, details, timestamp: new Date().toISOString() });
  results.summary.totalTests++;
  if (status === 'PASS') results.summary.passed++;
  else results.summary.failed++;

  const statusIcon = status === 'PASS' ? '✓' : '✗';
  console.log(`${statusIcon} ${name} (${duration}ms)${details ? ': ' + details : ''}`);
}

async function login(page) {
  await page.goto(`${BASE_URL}/auth`);
  await wait(2000);

  const buttons = await page.$$('button, a');
  for (const button of buttons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text && text.includes('Sign in') && !text.includes('Continue')) {
      await button.click();
      break;
    }
  }

  await wait(1000);
  await page.type('input[type="email"]', TEST_USER.email);
  await page.type('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await wait(5000);
}

async function takeScreenshot(page, name) {
  const screenshotPath = path.join(__dirname, 'production-screenshots', `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  results.visualRegression.screenshots.push({ name, path: screenshotPath });
  return screenshotPath;
}

async function mapPage(page, pageName) {
  const pageData = {
    name: pageName,
    url: page.url(),
    buttons: [],
    links: [],
    forms: [],
    inputs: [],
    images: [],
    timestamp: new Date().toISOString()
  };

  pageData.buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(btn => ({
      text: btn.textContent?.trim() || '',
      type: btn.type,
      classes: btn.className,
      visible: btn.offsetParent !== null
    }));
  });

  pageData.links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(link => ({
      text: link.textContent?.trim() || '',
      href: link.href,
      visible: link.offsetParent !== null
    }));
  });

  pageData.forms = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map(form => ({
      action: form.action,
      method: form.method,
      inputs: Array.from(form.querySelectorAll('input')).length
    }));
  });

  pageData.inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(input => ({
      type: input.type,
      placeholder: input.placeholder,
      name: input.name,
      required: input.required
    }));
  });

  pageData.images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      loaded: img.complete
    }));
  });

  results.siteMap.pages.push(pageData);
  return pageData;
}

async function runTests() {
  console.log('\\n🚀 Starting Comprehensive Production Testing...\\n');
  console.log(`Target: ${BASE_URL}`);
  console.log(`User: ${TEST_USER.email}\\n`);

  const startTime = Date.now();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const screenshotDir = path.join(__dirname, 'production-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('\\n📋 Testing All Pages & Features\\n');

    let testStart = Date.now();
    try {
      await page.goto(`${BASE_URL}/auth`);
      await wait(2000);
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      logTest('Load authentication page', 'PASS', Date.now() - testStart);
      await takeScreenshot(page, '01-auth');
      await mapPage(page, 'Auth');
    } catch (err) {
      logTest('Load authentication page', 'FAIL', Date.now() - testStart, err.message);
    }

    testStart = Date.now();
    try {
      await login(page);
      if (!page.url().includes('/auth')) {
        logTest('Login successful', 'PASS', Date.now() - testStart);
        await takeScreenshot(page, '02-after-login');
      } else {
        throw new Error('Still on auth');
      }
    } catch (err) {
      logTest('Login successful', 'FAIL', Date.now() - testStart, err.message);
    }

    const pages = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/catalog', name: 'Catalog' },
      { path: '/history', name: 'History' },
      { path: '/analytics', name: 'Analytics' },
      { path: '/settings', name: 'Settings' }
    ];

    for (let i = 0; i < pages.length; i++) {
      const { path: pagePath, name: pageName } = pages[i];
      testStart = Date.now();
      try {
        const loadStart = Date.now();
        await page.goto(`${BASE_URL}${pagePath}`);
        await wait(3000);
        const loadTime = Date.now() - loadStart;
        results.performance.loadTimes[pageName.toLowerCase()] = loadTime;
        logTest(`Load ${pageName}`, 'PASS', Date.now() - testStart, `${loadTime}ms`);
        await takeScreenshot(page, `0${i+3}-${pageName.toLowerCase()}`);
        await mapPage(page, pageName);
      } catch (err) {
        logTest(`Load ${pageName}`, 'FAIL', Date.now() - testStart, err.message);
      }
    }

    console.log('\\n📋 Visual Regression Tests\\n');

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      testStart = Date.now();
      try {
        await page.setViewport(viewport);
        await page.goto(`${BASE_URL}/dashboard`);
        await wait(2000);
        await takeScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
        logTest(`Responsive - ${viewport.name}`, 'PASS', Date.now() - testStart, `${viewport.width}x${viewport.height}`);
      } catch (err) {
        logTest(`Responsive - ${viewport.name}`, 'FAIL', Date.now() - testStart, err.message);
      }
    }

    await page.setViewport({ width: 1920, height: 1080 });

    console.log('\\n📋 UI/UX Tests\\n');

    testStart = Date.now();
    try {
      await page.goto(`${BASE_URL}/catalog`);
      await wait(3000);
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.complete || img.naturalHeight === 0).length;
      });

      if (brokenImages === 0) {
        logTest('All images load properly', 'PASS', Date.now() - testStart);
      } else {
        throw new Error(`${brokenImages} broken`);
      }
    } catch (err) {
      logTest('All images load properly', 'FAIL', Date.now() - testStart, err.message);
    }

    testStart = Date.now();
    try {
      await page.goto(`${BASE_URL}/dashboard`);
      await wait(2000);
      const title = await page.title();
      if (title.length > 0) {
        logTest('Has page title', 'PASS', Date.now() - testStart, title);
      } else {
        throw new Error('Empty title');
      }
    } catch (err) {
      logTest('Has page title', 'FAIL', Date.now() - testStart, err.message);
    }

  } catch (error) {
    console.error('\\n❌ Fatal error:', error);
    results.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }

  results.summary.duration = Date.now() - startTime;

  const reportPath = path.join(__dirname, 'production-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.totalTests}`);
  console.log(`✓ Passed: ${results.summary.passed}`);
  console.log(`✗ Failed: ${results.summary.failed}`);
  console.log(`Pass Rate: ${((results.summary.passed / results.summary.totalTests) * 100).toFixed(1)}%`);
  console.log(`Duration: ${(results.summary.duration / 1000).toFixed(2)}s`);
  console.log(`\\n📁 Reports:`);
  console.log(`  - ${reportPath}`);
  console.log(`  - ${screenshotDir}/`);
  console.log(`\\n✅ Complete!\\n`);
}

runTests().catch(console.error);
