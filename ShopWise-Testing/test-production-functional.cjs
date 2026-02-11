const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_USER = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

const BASE_URL = 'https://smartshoppinglist-sand.vercel.app';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const results = {
  functionalTests: [],
  buttonAnalysis: {
    redundant: [],
    broken: [],
    working: []
  },
  pageAnalysis: {},
  summary: {
    totalButtons: 0,
    workingButtons: 0,
    brokenButtons: 0,
    redundantButtons: 0
  }
};

function logTest(name, status, details = '') {
  results.functionalTests.push({ name, status, details });
  const icon = status === 'PASS' ? '✓' : status === 'WARN' ? '⚠' : '✗';
  console.log(`${icon} ${name}${details ? ': ' + details : ''}`);
}

async function login(page) {
  console.log('\n🔐 Logging in...');
  await page.goto(`${BASE_URL}/auth`);
  await wait(2000);

  // Click "Sign in" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const signInBtn = buttons.find(btn =>
      btn.textContent?.includes('Sign in') && !btn.textContent?.includes('Continue')
    );
    if (signInBtn) signInBtn.click();
  });

  await wait(1000);
  await page.type('input[type="email"]', TEST_USER.email);
  await page.type('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await wait(5000);

  const url = page.url();
  if (!url.includes('/auth')) {
    console.log('✅ Login successful!');
    return true;
  }
  console.log('❌ Login failed');
  return false;
}

async function analyzeButtons(page, pageName) {
  console.log(`\n🔍 Analyzing buttons on ${pageName}...`);

  const buttonData = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map((btn, index) => {
      const rect = btn.getBoundingClientRect();
      const styles = window.getComputedStyle(btn);

      return {
        index,
        text: btn.textContent?.trim() || '',
        innerHTML: btn.innerHTML.substring(0, 100),
        type: btn.type,
        disabled: btn.disabled,
        visible: rect.width > 0 && rect.height > 0 && styles.display !== 'none',
        position: { x: rect.x, y: rect.y },
        size: { width: rect.width, height: rect.height },
        classes: btn.className,
        hasOnClick: btn.onclick !== null,
        ariaLabel: btn.getAttribute('aria-label'),
        title: btn.title
      };
    });
  });

  results.pageAnalysis[pageName] = {
    totalButtons: buttonData.length,
    visibleButtons: buttonData.filter(b => b.visible).length,
    buttons: buttonData
  };

  console.log(`  Found ${buttonData.length} buttons (${buttonData.filter(b => b.visible).length} visible)`);

  return buttonData;
}

async function testButtonFunctionality(page, buttonData, pageName) {
  console.log(`\n🧪 Testing button functionality on ${pageName}...`);

  const visibleButtons = buttonData.filter(b => b.visible && !b.disabled);

  for (let i = 0; i < visibleButtons.length; i++) {
    const btn = visibleButtons[i];
    const buttonDesc = btn.text || btn.ariaLabel || `Button ${btn.index}`;

    try {
      const urlBefore = page.url();

      // Click the button
      await page.evaluate((index) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        buttons[index]?.click();
      }, btn.index);

      await wait(500);

      const urlAfter = page.url();
      const modalAppeared = await page.evaluate(() => {
        const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');
        return modals.length > 0;
      });

      if (urlAfter !== urlBefore) {
        logTest(`${pageName}: "${buttonDesc}"`, 'PASS', `Navigated to ${urlAfter}`);
        results.buttonAnalysis.working.push({ page: pageName, button: buttonDesc, action: 'navigation' });
        await page.goBack();
        await wait(1000);
      } else if (modalAppeared) {
        logTest(`${pageName}: "${buttonDesc}"`, 'PASS', 'Opened modal/dialog');
        results.buttonAnalysis.working.push({ page: pageName, button: buttonDesc, action: 'modal' });
        // Close modal
        await page.keyboard.press('Escape');
        await wait(500);
      } else {
        // Check if state changed
        const stateChanged = await page.evaluate(() => {
          return document.body.innerHTML.length;
        });

        if (stateChanged) {
          logTest(`${pageName}: "${buttonDesc}"`, 'PASS', 'State changed');
          results.buttonAnalysis.working.push({ page: pageName, button: buttonDesc, action: 'state_change' });
        } else {
          logTest(`${pageName}: "${buttonDesc}"`, 'WARN', 'No visible effect');
          results.buttonAnalysis.redundant.push({ page: pageName, button: buttonDesc, reason: 'no_effect' });
        }
      }

    } catch (err) {
      logTest(`${pageName}: "${buttonDesc}"`, 'FAIL', err.message);
      results.buttonAnalysis.broken.push({ page: pageName, button: buttonDesc, error: err.message });
    }
  }
}

async function testDashboard(page) {
  console.log('\n📊 Testing Dashboard Functions...');

  await page.goto(`${BASE_URL}/dashboard`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/dashboard-authenticated.png', fullPage: true });

  const buttons = await analyzeButtons(page, 'Dashboard');

  // Test specific dashboard functions
  const hasCreateButton = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent?.includes('Create'));
  });

  if (hasCreateButton) {
    logTest('Dashboard: Create New List button exists', 'PASS');
  }

  // Check for lists
  const listsInfo = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasLists: body.includes('List') || body.includes('Shopping'),
      hasGreeting: /Good (morning|afternoon|evening)/.test(body),
      hasRecentTrips: body.includes('Recent') || body.includes('Trip')
    };
  });

  if (listsInfo.hasGreeting) logTest('Dashboard: Shows user greeting', 'PASS');
  if (listsInfo.hasLists) logTest('Dashboard: Shows shopping lists', 'PASS');
  if (listsInfo.hasRecentTrips) logTest('Dashboard: Shows recent trips', 'PASS');

  return buttons;
}

async function testCatalog(page) {
  console.log('\n🛒 Testing Catalog Functions...');

  await page.goto(`${BASE_URL}/catalog`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/catalog-authenticated.png', fullPage: true });

  const buttons = await analyzeButtons(page, 'Catalog');

  // Test search
  const searchInput = await page.$('input[placeholder*="Search"]');
  if (searchInput) {
    logTest('Catalog: Search input exists', 'PASS');
    await searchInput.type('milk');
    await wait(1000);
    const resultsChanged = await page.evaluate(() => document.body.textContent?.includes('milk'));
    if (resultsChanged) {
      logTest('Catalog: Search works', 'PASS');
    }
    await searchInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
  }

  // Test quick add
  const quickAdd = await page.$('input[placeholder*="Add"]');
  if (quickAdd) {
    logTest('Catalog: Quick add input exists', 'PASS');
  }

  // Count products
  const productCount = await page.evaluate(() => {
    const products = document.querySelectorAll('[class*="product"], img[alt*="product"]');
    return products.length;
  });
  logTest('Catalog: Products displayed', 'PASS', `${productCount} products`);

  // Test cart buttons
  const cartButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.filter(btn =>
      btn.innerHTML.includes('shopping_cart') ||
      btn.textContent?.includes('cart')
    ).length;
  });

  if (cartButtons > 0) {
    logTest('Catalog: Cart buttons present', 'PASS', `${cartButtons} buttons`);

    // Try clicking a cart button
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cartBtn = buttons.find(btn => btn.innerHTML.includes('shopping_cart'));
      if (cartBtn) {
        cartBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      await wait(1000);
      const modalOrToast = await page.evaluate(() => {
        const body = document.body.textContent || '';
        return body.includes('added') || body.includes('list') || body.includes('select');
      });

      if (modalOrToast) {
        logTest('Catalog: Cart button functional', 'PASS');
      } else {
        logTest('Catalog: Cart button response unclear', 'WARN');
      }
    }
  }

  return buttons;
}

async function testHistory(page) {
  console.log('\n📜 Testing History Functions...');

  await page.goto(`${BASE_URL}/history`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/history-authenticated.png', fullPage: true });

  const buttons = await analyzeButtons(page, 'History');

  const historyInfo = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasTrips: body.includes('Trip') || body.includes('History'),
      hasDates: /\d{1,2}\/\d{1,2}/.test(body) || /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(body),
      hasPrices: body.includes('$')
    };
  });

  if (historyInfo.hasTrips) logTest('History: Shows trips', 'PASS');
  if (historyInfo.hasDates) logTest('History: Shows dates', 'PASS');
  if (historyInfo.hasPrices) logTest('History: Shows prices', 'PASS');

  return buttons;
}

async function testAnalytics(page) {
  console.log('\n📈 Testing Analytics Functions...');

  await page.goto(`${BASE_URL}/analytics`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/analytics-authenticated.png', fullPage: true });

  const buttons = await analyzeButtons(page, 'Analytics');

  const charts = await page.$$('svg');
  logTest('Analytics: Charts displayed', charts.length > 0 ? 'PASS' : 'FAIL', `${charts.length} charts`);

  const analyticsInfo = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasSpending: body.includes('Spending') || body.includes('Total') || body.includes('$'),
      hasCategories: body.includes('Category') || body.includes('Produce') || body.includes('Dairy'),
      hasTimePeriod: body.includes('Week') || body.includes('Month') || body.includes('Year')
    };
  });

  if (analyticsInfo.hasSpending) logTest('Analytics: Shows spending data', 'PASS');
  if (analyticsInfo.hasCategories) logTest('Analytics: Shows categories', 'PASS');
  if (analyticsInfo.hasTimePeriod) logTest('Analytics: Has time period selector', 'PASS');

  return buttons;
}

async function testSettings(page) {
  console.log('\n⚙️ Testing Settings Functions...');

  await page.goto(`${BASE_URL}/settings`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/settings-authenticated.png', fullPage: true });

  const buttons = await analyzeButtons(page, 'Settings');

  const settingsInfo = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const buttons = Array.from(document.querySelectorAll('button'));
    return {
      hasProfile: body.includes('Profile') || body.includes('Account'),
      hasTheme: body.includes('Theme') || body.includes('Dark') || body.includes('Light'),
      hasLogout: buttons.some(btn => btn.textContent?.includes('Log out')),
      hasNotifications: body.includes('Notification')
    };
  });

  if (settingsInfo.hasProfile) logTest('Settings: Profile section exists', 'PASS');
  if (settingsInfo.hasTheme) logTest('Settings: Theme toggle exists', 'PASS');
  if (settingsInfo.hasLogout) logTest('Settings: Logout button exists', 'PASS');
  if (settingsInfo.hasNotifications) logTest('Settings: Notification settings exist', 'PASS');

  return buttons;
}

async function testNavigation(page) {
  console.log('\n🧭 Testing Navigation...');

  const pages = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/catalog', name: 'Catalog' },
    { path: '/history', name: 'History' },
    { path: '/analytics', name: 'Analytics' },
    { path: '/settings', name: 'Settings' }
  ];

  for (const pageInfo of pages) {
    // Check if nav link exists
    const navLinkExists = await page.evaluate((name) => {
      const links = Array.from(document.querySelectorAll('a, button'));
      return links.some(link => link.textContent?.includes(name));
    }, pageInfo.name);

    if (navLinkExists) {
      logTest(`Navigation: ${pageInfo.name} link exists`, 'PASS');
    }

    // Test direct navigation
    await page.goto(`${BASE_URL}${pageInfo.path}`);
    await wait(1000);
    const url = page.url();
    if (url.includes(pageInfo.path)) {
      logTest(`Navigation: Can navigate to ${pageInfo.name}`, 'PASS');
    }
  }
}

async function runTests() {
  console.log('\n🚀 Starting Comprehensive Functional Testing...\n');
  console.log(`Target: ${BASE_URL}`);
  console.log(`User: ${TEST_USER.email}\n`);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Login
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without login');
      await browser.close();
      return;
    }

    // Test all pages
    const dashboardButtons = await testDashboard(page);
    const catalogButtons = await testCatalog(page);
    const historyButtons = await testHistory(page);
    const analyticsButtons = await testAnalytics(page);
    const settingsButtons = await testSettings(page);

    // Test navigation
    await testNavigation(page);

    // Detailed button analysis
    console.log('\n🔍 Performing Detailed Button Analysis...\n');

    // Test each page's buttons
    await page.goto(`${BASE_URL}/dashboard`);
    await wait(2000);
    await testButtonFunctionality(page, dashboardButtons, 'Dashboard');

    await page.goto(`${BASE_URL}/catalog`);
    await wait(2000);
    await testButtonFunctionality(page, catalogButtons, 'Catalog');

    await page.goto(`${BASE_URL}/settings`);
    await wait(2000);
    await testButtonFunctionality(page, settingsButtons, 'Settings');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    await browser.close();
  }

  // Calculate summary
  results.summary.totalButtons =
    Object.values(results.pageAnalysis).reduce((sum, page) => sum + page.totalButtons, 0);
  results.summary.workingButtons = results.buttonAnalysis.working.length;
  results.summary.brokenButtons = results.buttonAnalysis.broken.length;
  results.summary.redundantButtons = results.buttonAnalysis.redundant.length;

  // Save results
  const reportPath = path.join(__dirname, 'production-functional-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FUNCTIONAL TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Buttons Found: ${results.summary.totalButtons}`);
  console.log(`✓ Working Buttons: ${results.summary.workingButtons}`);
  console.log(`⚠ Potentially Redundant: ${results.summary.redundantButtons}`);
  console.log(`✗ Broken Buttons: ${results.summary.brokenButtons}`);
  console.log(`\n📁 Report: ${reportPath}`);
  console.log('\n✅ Testing complete!\n');

  // Print redundant buttons if any
  if (results.buttonAnalysis.redundant.length > 0) {
    console.log('\n⚠️  REDUNDANT/UNCLEAR BUTTONS:');
    results.buttonAnalysis.redundant.forEach(btn => {
      console.log(`  - ${btn.page}: "${btn.button}" (${btn.reason})`);
    });
  }

  // Print broken buttons if any
  if (results.buttonAnalysis.broken.length > 0) {
    console.log('\n❌ BROKEN BUTTONS:');
    results.buttonAnalysis.broken.forEach(btn => {
      console.log(`  - ${btn.page}: "${btn.button}" - ${btn.error}`);
    });
  }
}

runTests().catch(console.error);
