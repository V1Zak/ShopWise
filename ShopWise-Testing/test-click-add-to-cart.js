import puppeteer from 'puppeteer';
import path from 'path';

const APP_URL = 'http://localhost:5173';
const CREDENTIALS = {
  email: 'slav25.ai@gmail.com',
  password: 'Slav!1'
};

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filename = `click-test-${name}.png`;
  const filepath = path.join(process.cwd(), 'screenshots', filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot: ${filename}`);
  return filename;
}

async function main() {
  console.log('=== TESTING: Click shopping cart buttons ===\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized'],
    slowMo: 50 // Slow down actions to see what's happening
  });

  const page = await browser.newPage();

  try {
    // Login
    console.log('1. Logging in...');
    await page.goto(`${APP_URL}/auth`, { waitUntil: 'networkidle0' });
    await wait(2000);

    const buttons = await page.$$('button, a');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Sign in') && !text.includes('Continue')) {
        await btn.click();
        break;
      }
    }
    await wait(2000);

    await page.type('input[type="email"]', CREDENTIALS.email, { delay: 50 });
    await page.type('input[type="password"]', CREDENTIALS.password, { delay: 50 });
    await page.click('button[type="submit"]');
    await wait(5000);
    console.log('✓ Logged in\n');

    // Go to catalog
    console.log('2. Navigating to catalog...');
    await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
    await wait(3000);
    await takeScreenshot(page, '01-catalog');
    console.log('✓ On catalog page\n');

    // Find the first product card with Eggs
    console.log('3. Finding "Eggs" product...');
    const eggsCard = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const eggsElement = allElements.find(el => el.textContent.includes('Eggs') && el.textContent.includes('$7.12'));
      return eggsElement ? true : false;
    });
    console.log(`Eggs product found: ${eggsCard}\n`);

    // Try clicking the shopping cart button for Sprouts ($6.49)
    console.log('4. Looking for shopping cart buttons...');
    const cartButtons = await page.$$('button');
    let clickedButton = false;

    for (let i = 0; i < cartButtons.length; i++) {
      const btn = cartButtons[i];
      const html = await page.evaluate(el => el.innerHTML, btn);
      const isCartButton = html.includes('add_shopping_cart') || html.includes('shopping_cart');

      if (isCartButton && !clickedButton) {
        console.log(`Found shopping cart button ${i}`);
        console.log('  Clicking it...');

        await btn.click();
        await wait(3000);
        await takeScreenshot(page, '02-after-cart-click');

        clickedButton = true;
        break;
      }
    }

    if (!clickedButton) {
      console.log('✗ No shopping cart button found\n');
    } else {
      console.log('✓ Clicked shopping cart button\n');

      // Check for modal
      console.log('5. Checking for modal/dialog...');
      const modal = await page.$('[role="dialog"], .modal, [class*="Modal"]');
      if (modal) {
        console.log('✓ Modal opened!\n');
        await takeScreenshot(page, '03-modal-opened');

        // Look for content in modal
        const modalContent = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], .modal, [class*="Modal"]');
          return dialog ? dialog.textContent : '';
        });

        console.log('Modal content preview:');
        console.log(modalContent.substring(0, 200));
        console.log('\n');

        // Look for list selection
        const hasListOptions = modalContent.toLowerCase().includes('list');
        console.log(`Modal has list selection: ${hasListOptions}\n`);

        await wait(5000);
      } else {
        console.log('✗ No modal opened\n');
        console.log('Checking current URL...');
        console.log(`URL: ${page.url()}\n`);
      }
    }

    // Try the quick add at top
    console.log('6. Testing quick add input at top...');
    await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
    await wait(2000);

    const quickAddInput = await page.$('input[placeholder*="Add item"]');
    if (quickAddInput) {
      console.log('✓ Found quick add input');
      await quickAddInput.click();
      await quickAddInput.type('Bananas $2.99', { delay: 100 });
      await wait(1000);
      await takeScreenshot(page, '04-quick-add-typed');

      // Click the Add button
      const addButton = await page.$('button:has-text("Add")');
      // Puppeteer doesn't support :has-text, so find by position
      const topButtons = await page.$$('button');
      let foundAddButton = false;

      for (const btn of topButtons) {
        const text = await page.evaluate(el => el.textContent.trim(), btn);
        if (text === 'Add') {
          console.log('  Clicking "Add" button...');
          await btn.click();
          await wait(3000);
          await takeScreenshot(page, '05-after-quick-add');
          foundAddButton = true;
          break;
        }
      }

      if (foundAddButton) {
        console.log('✓ Clicked Add button\n');

        // Check for modal or confirmation
        const modalAfterAdd = await page.$('[role="dialog"], .modal');
        if (modalAfterAdd) {
          console.log('✓ Modal opened after quick add!');
          await takeScreenshot(page, '06-quick-add-modal');
        } else {
          console.log('✗ No modal after quick add');
        }
      }
    } else {
      console.log('✗ Quick add input not found\n');
    }

    // Check if there's a way to edit products or add images
    console.log('\n7. Looking for product edit/image upload...');
    await page.goto(`${APP_URL}/catalog`, { waitUntil: 'networkidle0' });
    await wait(2000);

    // Hover over Eggs product to see if edit button appears
    console.log('  Hovering over first product...');
    const firstProductArea = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const eggsDiv = allDivs.find(div => {
        const text = div.textContent;
        return text.includes('Eggs') && text.includes('$7.12') && text.includes('Sprouts');
      });
      if (eggsDiv) {
        eggsDiv.scrollIntoView();
        return true;
      }
      return false;
    });

    if (firstProductArea) {
      console.log('  Found Eggs product area');

      // Look for pin/edit button in top corner
      console.log('  Looking for pin/edit buttons...');
      const pinButton = await page.$('button[class*="pin"], button[aria-label*="pin"]');
      if (pinButton) {
        console.log('  ✓ Found pin button, clicking...');
        await pinButton.click();
        await wait(3000);
        await takeScreenshot(page, '07-after-pin-click');
      }

      // Try clicking the product card itself
      await page.evaluate(() => {
        const allDivs = Array.from(document.querySelectorAll('div'));
        const eggsDiv = allDivs.find(div => {
          const text = div.textContent;
          return text.includes('Eggs') && text.includes('$7.12');
        });
        if (eggsDiv && eggsDiv.click) {
          eggsDiv.click();
        }
      });

      await wait(3000);
      await takeScreenshot(page, '08-after-product-click');

      // Check URL and for modal
      console.log(`  Current URL: ${page.url()}`);
      const detailModal = await page.$('[role="dialog"]');
      if (detailModal) {
        console.log('  ✓ Product detail modal opened!');
        await takeScreenshot(page, '09-product-detail-modal');
      }
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('Check screenshots for visual confirmation');

    await wait(5000);

  } catch (error) {
    console.error('ERROR:', error.message);
    await takeScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
