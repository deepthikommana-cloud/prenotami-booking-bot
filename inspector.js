const { chromium } = require('playwright');
require('dotenv').config();

/**
 * Inspector tool to help find correct selectors on the website
 * Run this to explore the page structure and find element selectors
 */

async function inspect() {
  console.log('🔍 Starting Inspector Tool...');
  console.log('This will open a browser where you can manually navigate and inspect elements\n');

  const browser = await chromium.launch({
    headless: false, // Always show browser for inspection
    slowMo: 100 // Slow down operations to see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Navigate to the site
  console.log('📍 Navigating to https://prenotami.esteri.it/');
  await page.goto('https://prenotami.esteri.it/', {
    waitUntil: 'networkidle'
  });

  console.log('\n✅ Browser opened!');
  console.log('\n📋 Instructions:');
  console.log('1. Open DevTools (F12 or right-click → Inspect)');
  console.log('2. Use the element picker to find selectors');
  console.log('3. Right-click elements → Copy → Copy selector');
  console.log('4. Update the selectors in bot.js');
  console.log('5. Press Ctrl+C in this terminal when done\n');

  // Print current page info
  const title = await page.title();
  console.log(`📄 Page Title: ${title}`);

  // Wait for user to inspect
  await page.pause(); // This opens Playwright Inspector

  await browser.close();
  console.log('\n🧹 Browser closed');
}

inspect().catch(console.error);
