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

  console.log('2. Current URL:', page.url());

  console.log('3. Looking for Sign in button...');
  const signInButtonText = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    return buttons.map(btn => btn.textContent?.trim()).filter(text => text && text.includes('Sign'));
  });
  console.log('   Found buttons with "Sign":', signInButtonText);

  console.log('4. Clicking Sign in button...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const signInBtn = buttons.find(btn =>
      btn.textContent?.includes('Sign in') && !btn.textContent?.includes('Continue')
    );
    if (signInBtn) {
      console.log('Found button:', signInBtn.textContent);
      signInBtn.click();
      return true;
    }
    return false;
  });

  console.log('   Clicked:', clicked);
  await wait(2000);

  console.log('5. Taking screenshot before filling form...');
  await page.screenshot({ path: 'debug-before-fill.png' });

  console.log('6. Filling email...');
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.type(TEST_USER.email, { delay: 100 });
    console.log('   Email filled');
  } else {
    console.log('   ❌ Email input not found!');
  }

  console.log('7. Filling password...');
  const passwordInput = await page.$('input[type="password"]');
  if (passwordInput) {
    await passwordInput.type(TEST_USER.password, { delay: 100 });
    console.log('   Password filled');
  } else {
    console.log('   ❌ Password input not found!');
  }

  await wait(1000);
  console.log('8. Taking screenshot after filling form...');
  await page.screenshot({ path: 'debug-after-fill.png' });

  console.log('9. Looking for submit button...');
  const submitButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
    return buttons.map(btn => ({
      text: btn.textContent?.trim(),
      disabled: btn.disabled,
      visible: btn.offsetParent !== null
    }));
  });
  console.log('   Submit buttons:', submitButtons);

  console.log('10. Clicking submit...');
  await page.click('button[type="submit"]');
  console.log('   Submit clicked');

  console.log('11. Waiting for navigation...');
  await wait(8000);

  console.log('12. Final URL:', page.url());
  console.log('13. Taking final screenshot...');
  await page.screenshot({ path: 'debug-final.png' });

  const bodyText = await page.evaluate(() => document.body.textContent?.substring(0, 500));
  console.log('14. Page text (first 500 chars):', bodyText);

  await wait(5000);
  await browser.close();
}

testLogin().catch(console.error);
