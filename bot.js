const { chromium } = require('playwright');
require('dotenv').config();

const CONFIG = {
  url: 'https://prenotami.esteri.it/',
  username: process.env.USERNAME || '',
  password: process.env.PASSWORD || '',
  headless: process.env.HEADLESS !== 'false',
  checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000, // 1 minute default
  maxRetries: parseInt(process.env.MAX_RETRIES) || 10,
};

class PrenotamiBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.retryCount = 0;
  }

  async initialize() {
    console.log('🚀 Starting Prenotami Booking Bot...');
    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for Railway
    });
    this.page = await this.browser.newPage();

    // Set viewport and user agent to appear more human-like
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,it;q=0.8'
    });
  }

  async navigateToSite() {
    console.log('📍 Navigating to', CONFIG.url);
    await this.page.goto(CONFIG.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await this.randomDelay(1000, 3000);
  }

  async login() {
    console.log('🔐 Attempting to login...');

    try {
      // Look for login/signin button or link
      // Common selectors - adjust based on actual page structure
      const loginSelectors = [
        'text=/sign.*in/i',
        'text=/accedi/i',
        'text=/login/i',
        'a:has-text("Sign in")',
        'a:has-text("Accedi")',
        'button:has-text("Sign in")',
        'button:has-text("Accedi")'
      ];

      let clicked = false;
      for (const selector of loginSelectors) {
        try {
          await this.page.click(selector, { timeout: 3000 });
          clicked = true;
          console.log('✅ Clicked login button');
          break;
        } catch (e) {
          // Try next selector
        }
      }

      if (!clicked) {
        console.log('⚠️  Could not find login button, may already be on login page');
      }

      await this.randomDelay(1000, 2000);

      // Fill in credentials
      // Try different possible selectors for username/email field
      const usernameSelectors = [
        'input[name="username"]',
        'input[name="email"]',
        'input[type="email"]',
        'input[id*="user"]',
        'input[id*="email"]',
        '#username',
        '#email'
      ];

      for (const selector of usernameSelectors) {
        try {
          await this.page.fill(selector, CONFIG.username, { timeout: 3000 });
          console.log('✅ Filled username');
          break;
        } catch (e) {
          // Try next selector
        }
      }

      await this.randomDelay(500, 1000);

      // Fill password
      const passwordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        '#password'
      ];

      for (const selector of passwordSelectors) {
        try {
          await this.page.fill(selector, CONFIG.password, { timeout: 3000 });
          console.log('✅ Filled password');
          break;
        } catch (e) {
          // Try next selector
        }
      }

      await this.randomDelay(500, 1000);

      // Submit login form
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Accedi")',
        'button:has-text("Sign in")'
      ];

      for (const selector of submitSelectors) {
        try {
          await this.page.click(selector, { timeout: 3000 });
          console.log('✅ Clicked submit button');
          break;
        } catch (e) {
          // Try next selector
        }
      }

      // Wait for navigation after login
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      console.log('✅ Login successful');

    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  async clickBookButton() {
    console.log('📅 Looking for Book/Prenota button...');

    try {
      const bookSelectors = [
        'text=/prenota/i',
        'text=/book/i',
        'a:has-text("Prenota")',
        'a:has-text("Book")',
        'button:has-text("Prenota")',
        'button:has-text("Book")',
        '[href*="book"]',
        '[href*="prenota"]'
      ];

      for (const selector of bookSelectors) {
        try {
          await this.page.click(selector, { timeout: 3000 });
          console.log('✅ Clicked Book/Prenota button');
          await this.randomDelay(2000, 3000);
          return true;
        } catch (e) {
          // Try next selector
        }
      }

      console.log('⚠️  Could not find Book button');
      return false;

    } catch (error) {
      console.error('❌ Error clicking Book button:', error.message);
      return false;
    }
  }

  async selectSchengenAppointment() {
    console.log('🔍 Looking for Schengen appointment link...');

    try {
      const schengenSelectors = [
        'text=/schengen/i',
        'a:has-text("Schengen")',
        'button:has-text("Schengen")',
        '[href*="schengen"]',
        'text=/visto/i' // "visa" in Italian
      ];

      for (const selector of schengenSelectors) {
        try {
          const element = await this.page.locator(selector).first();
          await element.click({ timeout: 3000 });
          console.log('✅ Clicked Schengen appointment link');
          await this.randomDelay(2000, 3000);
          return true;
        } catch (e) {
          // Try next selector
        }
      }

      console.log('⚠️  Could not find Schengen link');
      return false;

    } catch (error) {
      console.error('❌ Error selecting Schengen:', error.message);
      return false;
    }
  }

  async checkAvailability() {
    console.log('🔎 Checking for available appointments...');

    try {
      // Look for availability indicators
      const content = await this.page.content();

      // Check for common availability patterns
      const availabilityPatterns = [
        /disponibil/i, // "available" in Italian
        /available/i,
        /prenota/i,
        /book now/i,
        /slot.*available/i
      ];

      for (const pattern of availabilityPatterns) {
        if (pattern.test(content)) {
          console.log('🎉 AVAILABILITY FOUND!');
          await this.takeScreenshot('availability-found');
          return true;
        }
      }

      // Check for "no availability" messages
      const noAvailabilityPatterns = [
        /non.*disponibil/i,
        /no.*available/i,
        /nessun.*appuntamento/i,
        /no.*appointment/i
      ];

      for (const pattern of noAvailabilityPatterns) {
        if (pattern.test(content)) {
          console.log('❌ No appointments available');
          return false;
        }
      }

      console.log('⚠️  Could not determine availability');
      await this.takeScreenshot('availability-unknown');
      return false;

    } catch (error) {
      console.error('❌ Error checking availability:', error.message);
      return false;
    }
  }

  async takeScreenshot(name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${name}-${timestamp}.png`;
      await this.page.screenshot({ path: filename, fullPage: true });
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to take screenshot:', error.message);
    }
  }

  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.page.waitForTimeout(delay);
  }

  async run() {
    try {
      await this.initialize();
      await this.navigateToSite();
      await this.takeScreenshot('initial-page');

      await this.login();
      await this.takeScreenshot('after-login');

      await this.clickBookButton();
      await this.takeScreenshot('after-book-click');

      await this.selectSchengenAppointment();
      await this.takeScreenshot('after-schengen-select');

      const available = await this.checkAvailability();

      if (available) {
        console.log('🎉 SUCCESS! Appointment available!');
        // Keep browser open if appointment found
        console.log('⏸️  Browser will remain open for manual booking');
        if (process.env.WEBHOOK_URL) {
          await this.sendNotification('Appointment available!');
        }
        return true;
      } else {
        console.log('⏳ No appointments available, will retry...');
        return false;
      }

    } catch (error) {
      console.error('❌ Bot error:', error.message);
      await this.takeScreenshot('error');
      throw error;
    }
  }

  async sendNotification(message) {
    try {
      const fetch = (await import('node-fetch')).default;
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
      console.log('📢 Notification sent');
    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const bot = new PrenotamiBot();

  // Validation
  if (!CONFIG.username || !CONFIG.password) {
    console.error('❌ USERNAME and PASSWORD must be set in environment variables');
    process.exit(1);
  }

  let foundAppointment = false;

  while (bot.retryCount < CONFIG.maxRetries && !foundAppointment) {
    try {
      console.log(`\n🔄 Attempt ${bot.retryCount + 1}/${CONFIG.maxRetries}`);
      foundAppointment = await bot.run();

      if (!foundAppointment) {
        bot.retryCount++;
        await bot.cleanup();

        if (bot.retryCount < CONFIG.maxRetries) {
          console.log(`⏰ Waiting ${CONFIG.checkInterval / 1000} seconds before next check...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
        }
      }

    } catch (error) {
      console.error('❌ Error in main loop:', error.message);
      bot.retryCount++;
      await bot.cleanup();

      if (bot.retryCount < CONFIG.maxRetries) {
        console.log(`⏰ Waiting ${CONFIG.checkInterval / 1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
      }
    }
  }

  if (!foundAppointment) {
    console.log('❌ Max retries reached. Exiting...');
    await bot.cleanup();
    process.exit(1);
  }

  // If appointment found, keep running (browser stays open for manual completion)
  console.log('✅ Bot completed successfully');
  process.exit(0);
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n⚠️  Interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Terminated');
  process.exit(0);
});

// Run the bot
main().catch(console.error);
