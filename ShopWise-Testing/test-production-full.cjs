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
  buttonInventory: {},
  redundantButtons: [],
  brokenButtons: [],
  workingFeatures: [],
  summary: {}
};

function log(message) {
  console.log(message);
  results.functionalTests.push({ message, timestamp: new Date().toISOString() });
}

async function login(page) {
  log('\n🔐 Logging in...');
  await page.goto(`${BASE_URL}/auth`);
  await wait(2000);

  const signInButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => 
      btn.textContent?.trim() === 'Sign In' || 
      (btn.textContent?.includes('Sign In') && btn.textContent?.length < 20)
    );
  });

  if (signInButton) {
    await signInButton.click();
    await wait(1500);
  }

  await page.type('input[type="email"]', TEST_USER.email, { delay: 50 });
  await page.type('input[type="password"]', TEST_USER.password, { delay: 50 });
  await page.click('button[type="submit"]');

  await Promise.race([
    page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
    wait(10000)
  ]);

  const success = !page.url().includes('/auth');
  log(success ? '✅ Login successful' : '❌ Login failed');
  return success;
}

async function analyzePageButtons(page, pageName) {
  log(`\n📋 Analyzing ${pageName}...`);

  const buttonData = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const inputs = Array.from(document.querySelectorAll('input'));
    const links = Array.from(document.querySelectorAll('a'));

    return {
      buttons: buttons.map(btn => ({
        text: btn.textContent?.trim() || btn.innerHTML.substring(0, 50),
        type: btn.type,
        disabled: btn.disabled,
        visible: btn.offsetParent !== null,
        classes: btn.className.substring(0, 100)
      })).filter(b => b.visible),
      inputs: inputs.map(inp => ({
        type: inp.type,
        placeholder: inp.placeholder,
        name: inp.name
      })),
      links: links.map(a => ({
        text: a.textContent?.trim(),
        href: a.href
      })).filter(l => l.text && l.text.length > 0)
    };
  });

  results.buttonInventory[pageName] = buttonData;

  log(`  Buttons: ${buttonData.buttons.length}`);
  log(`  Inputs: ${buttonData.inputs.length}`);
  log(`  Links: ${buttonData.links.length}`);

  // Print button details
  buttonData.buttons.forEach((btn, i) => {
    if (btn.text.length > 0 && btn.text.length < 100) {
      log(`    ${i + 1}. "${btn.text}" (${btn.type || 'button'})`);
    }
  });

  return buttonData;
}

async function testDashboard(page) {
  await page.goto(`${BASE_URL}/`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/dashboard-full.png', fullPage: true });

  const pageData = await analyzePageButtons(page, 'Dashboard');

  // Test specific features
  const features = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const html = document.body.innerHTML;

    return {
      hasGreeting: /Good (morning|afternoon|evening)/.test(body),
      hasActiveListsSection: body.includes('Active') && body.includes('List'),
      hasRecentTrips: body.includes('Recent'),
      hasCreateButton: html.includes('Create') || html.includes('add'),
      listsCount: (body.match(/\$\d+\.\d{2}/g) || []).length,
      hasStats: body.includes('Total') || body.includes('Average')
    };
  });

  log(`\n  Features:`);
  log(`    Greeting: ${features.hasGreeting ? '✅' : '❌'}`);
  log(`    Active Lists: ${features.hasActiveListsSection ? '✅' : '❌'}`);
  log(`    Recent Trips: ${features.hasRecentTrips ? '✅' : '❌'}`);
  log(`    Create Button: ${features.hasCreateButton ? '✅' : '❌'}`);
  log(`    Price displays: ${features.listsCount}`);

  if (features.hasGreeting) results.workingFeatures.push('Dashboard: User greeting');
  if (features.hasCreateButton) results.workingFeatures.push('Dashboard: Create list button');

  return pageData;
}

async function testCatalog(page) {
  await page.goto(`${BASE_URL}/catalog`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/catalog-full.png', fullPage: true });

  const pageData = await analyzePageButtons(page, 'Catalog');

  const features = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const images = document.querySelectorAll('img');
    const cartButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
      btn.innerHTML.includes('shopping_cart')
    );

    return {
      productImages: images.length,
      hasSearch: Array.from(document.querySelectorAll('input')).some(inp =>
        inp.placeholder?.toLowerCase().includes('search')
      ),
      hasQuickAdd: Array.from(document.querySelectorAll('input')).some(inp =>
        inp.placeholder?.toLowerCase().includes('add')
      ),
      cartButtonCount: cartButtons.length,
      categories: (body.match(/Produce|Dairy|Meat|Bakery|Beverages/g) || []).length,
      productCount: (body.match(/\$\d+\.\d{2}/g) || []).length
    };
  });

  log(`\n  Features:`);
  log(`    Product Images: ${features.productImages}`);
  log(`    Search: ${features.hasSearch ? '✅' : '❌'}`);
  log(`    Quick Add: ${features.hasQuickAdd ? '✅' : '❌'}`);
  log(`    Cart Buttons: ${features.cartButtonCount}`);
  log(`    Products with prices: ${features.productCount}`);

  // Test cart button
  if (features.cartButtonCount > 0) {
    log(`\n  Testing cart button...`);
    const cartResult = await page.evaluate(() => {
      const cartBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.innerHTML.includes('shopping_cart')
      );
      if (cartBtn) {
        cartBtn.click();
        return true;
      }
      return false;
    });

    await wait(1500);

    const response = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return {
        hasModal: document.querySelectorAll('[role="dialog"]').length > 0,
        hasToast: body.includes('added') || body.includes('Added'),
        hasError: body.includes('No lists') || body.includes('error')
      };
    });

    if (response.hasModal) {
      log(`    Cart button opens modal ✅`);
      results.workingFeatures.push('Catalog: Cart button opens list selector');
    } else if (response.hasToast) {
      log(`    Cart button shows toast ✅`);
      results.workingFeatures.push('Catalog: Cart button adds to list');
    } else if (response.hasError) {
      log(`    Cart button shows error ⚠️`);
      results.brokenButtons.push({ page: 'Catalog', button: 'Cart', issue: 'Shows error message' });
    }
  }

  // Test search
  if (features.hasSearch) {
    log(`\n  Testing search...`);
    const searchInput = await page.$('input[placeholder*="Search"], input[placeholder*="search"]');
    if (searchInput) {
      await searchInput.type('eggs');
      await wait(1500);
      const searchWorked = await page.evaluate(() =>
        document.body.textContent?.toLowerCase().includes('eggs') || 
        document.body.textContent?.toLowerCase().includes('egg')
      );
      log(`    Search functionality: ${searchWorked ? '✅' : '❌'}`);
      if (searchWorked) results.workingFeatures.push('Catalog: Search filter');
    }
  }

  return pageData;
}

async function testHistory(page) {
  await page.goto(`${BASE_URL}/history`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/history-full.png', fullPage: true });

  const pageData = await analyzePageButtons(page, 'History');

  const features = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasTrips: body.includes('Trip') || body.includes('History'),
      hasDates: /\d{1,2}\/\d{1,2}/.test(body) || /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(body),
      hasTotals: (body.match(/\$\d+\.\d{2}/g) || []).length,
      hasStores: body.includes('Store') || body.includes('Walmart') || body.includes('Target'),
      tripCount: (body.match(/Trip|trip/g) || []).length
    };
  });

  log(`\n  Features:`);
  log(`    Has trips: ${features.hasTrips ? '✅' : '❌'}`);
  log(`    Shows dates: ${features.hasDates ? '✅' : '❌'}`);
  log(`    Shows totals: ${features.hasTotals} prices`);
  log(`    Shows stores: ${features.hasStores ? '✅' : '❌'}`);

  return pageData;
}

async function testAnalytics(page) {
  await page.goto(`${BASE_URL}/analytics`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/analytics-full.png', fullPage: true });

  const pageData = await analyzePageButtons(page, 'Analytics');

  const features = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const svgs = document.querySelectorAll('svg');

    return {
      chartCount: svgs.length,
      hasSpending: body.includes('Spending') || body.includes('Total'),
      hasCategories: body.includes('Category') || body.includes('Breakdown'),
      hasTimePeriod: body.includes('Week') || body.includes('Month') || body.includes('Year'),
      hasTrends: body.includes('Trend') || body.includes('Average'),
      priceCount: (body.match(/\$\d+\.\d{2}/g) || []).length
    };
  });

  log(`\n  Features:`);
  log(`    Charts: ${features.chartCount}`);
  log(`    Spending data: ${features.hasSpending ? '✅' : '❌'}`);
  log(`    Category breakdown: ${features.hasCategories ? '✅' : '❌'}`);
  log(`    Time period selector: ${features.hasTimePeriod ? '✅' : '❌'}`);
  log(`    Price displays: ${features.priceCount}`);

  if (features.chartCount > 0) results.workingFeatures.push('Analytics: Charts/visualizations');
  if (features.hasSpending) results.workingFeatures.push('Analytics: Spending data');

  return pageData;
}

async function testSettings(page) {
  await page.goto(`${BASE_URL}/settings`);
  await wait(3000);
  await page.screenshot({ path: 'production-screenshots/settings-full.png', fullPage: true });

  const pageData = await analyzePageButtons(page, 'Settings');

  const features = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const buttons = Array.from(document.querySelectorAll('button'));

    return {
      hasProfile: body.includes('Profile') || body.includes('Account'),
      hasTheme: body.includes('Theme') || body.includes('Dark') || body.includes('Light'),
      hasLogout: buttons.some(btn => btn.textContent?.includes('Log out')),
      hasNotifications: body.includes('Notification'),
      hasPreferences: body.includes('Preference') || body.includes('Settings')
    };
  });

  log(`\n  Features:`);
  log(`    Profile section: ${features.hasProfile ? '✅' : '❌'}`);
  log(`    Theme toggle: ${features.hasTheme ? '✅' : '❌'}`);
  log(`    Logout button: ${features.hasLogout ? '✅' : '❌'}`);
  log(`    Notifications: ${features.hasNotifications ? '✅' : '❌'}`);

  if (features.hasTheme) results.workingFeatures.push('Settings: Theme toggle');
  if (features.hasLogout) results.workingFeatures.push('Settings: Logout');

  return pageData;
}

async function runTests() {
  log('🚀 Starting Comprehensive Functional Analysis\n');
  log(`Target: ${BASE_URL}`);
  log(`User: ${TEST_USER.email}\n`);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      log('❌ Login failed - cannot proceed');
      await browser.close();
      return;
    }

    await testDashboard(page);
    await testCatalog(page);
    await testHistory(page);
    await testAnalytics(page);
    await testSettings(page);

  } catch (error) {
    log(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Summary
  const totalButtons = Object.values(results.buttonInventory).reduce((sum, page) =>
    sum + page.buttons.length, 0
  );

  results.summary = {
    totalButtons,
    workingFeatures: results.workingFeatures.length,
    brokenButtons: results.brokenButtons.length,
    redundantButtons: results.redundantButtons.length,
    pagesAnalyzed: Object.keys(results.buttonInventory).length
  };

  const reportPath = 'production-functional-analysis.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  log('\n' + '='.repeat(60));
  log('📊 ANALYSIS SUMMARY');
  log('='.repeat(60));
  log(`Pages Analyzed: ${results.summary.pagesAnalyzed}`);
  log(`Total Buttons: ${results.summary.totalButtons}`);
  log(`Working Features: ${results.summary.workingFeatures}`);
  log(`Broken Features: ${results.summary.brokenButtons}`);
  log(`\n✅ Report: ${reportPath}\n`);

  if (results.workingFeatures.length > 0) {
    log('✅ WORKING FEATURES:');
    results.workingFeatures.forEach(f => log(`  - ${f}`));
  }

  if (results.brokenButtons.length > 0) {
    log('\n❌ ISSUES FOUND:');
    results.brokenButtons.forEach(b => log(`  - ${b.page}: ${b.button} - ${b.issue}`));
  }
}

runTests().catch(console.error);
