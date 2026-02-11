const puppeteer = require('puppeteer');

const TEST_USER = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function testLogin() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('1. Going to auth page...');
  await page.goto('https://smartshoppinglist-sand.vercel.app/auth');
  await wait(3000);

  console.log('2. Clicking Sign In tab (attempt 1 - direct selector)...');
  try {
    // Try to click by finding the button with exact text
    const signInButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => 
        btn.textContent?.trim() === 'Sign In' || 
        (btn.textContent?.includes('Sign In') && btn.textContent?.length < 20)
      );
    });

    if (signInButton) {
      await signInButton.click();
      console.log('   ✅ Clicked Sign In button');
      await wait(1500);
    }
  } catch (e) {
    console.log('   ❌ Failed:', e.message);
  }

  console.log('3. Taking screenshot after click...');
  await page.screenshot({ path: 'login-after-tab-click.png' });

  console.log('4. Checking which form is showing...');
  const formInfo = await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    return {
      submitText: submitBtn?.textContent?.trim(),
      bodyText: document.body.textContent?.substring(0, 1000)
    };
  });
  console.log('   Submit button text:', formInfo.submitText);

  console.log('5. Filling credentials...');
  await page.type('input[type="email"]', TEST_USER.email, { delay: 50 });
  await page.type('input[type="password"]', TEST_USER.password, { delay: 50 });

  await wait(1000);
  console.log('6. Taking screenshot with filled form...');
  await page.screenshot({ path: 'login-form-filled.png' });

  console.log('7. Clicking submit...');
  await page.click('button[type="submit"]');

  console.log('8. Waiting for navigation...');
  await Promise.race([
    page.waitForNavigation({ timeout: 10000 }).catch(() => console.log('   Navigation timeout')),
    wait(10000)
  ]);

  console.log('9. Final URL:', page.url());

  if (!page.url().includes('/auth')) {
    console.log('✅ LOGIN SUCCESSFUL!');
    await page.screenshot({ path: 'login-success.png', fullPage: true });

    // Test navigation to different pages
    console.log('\n10. Testing navigation to Dashboard...');
    await page.goto('https://smartshoppinglist-sand.vercel.app/dashboard');
    await wait(2000);
    console.log('    Dashboard URL:', page.url());
    await page.screenshot({ path: 'dashboard.png', fullPage: true });

  } else {
    console.log('❌ LOGIN FAILED - still on auth page');
    const errorMsg = await page.evaluate(() => {
      const body = document.body.textContent || '';
      if (body.includes('Invalid')) return 'Invalid credentials message found';
      if (body.includes('Error')) return 'Error message found';
      return 'No error message found';
    });
    console.log('   Error check:', errorMsg);
  }

  await wait(3000);
  await browser.close();
}

testLogin().catch(console.error);
