const { chromium } = require('playwright');
require('dotenv').config();

const CONFIG = {
  url: 'https://prenotami.esteri.it/',
  username: process.env.USERNAME || '',
  password: process.env.PASSWORD || '',
  headless: process.env.HEADLESS !== 'false',
  checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000, // 1 minute default
  maxRetries: parseInt(process.env.MAX_RETRIES) || Infinity, // Run continuously by default
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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'it-IT',
      timezoneId: 'Europe/Rome'
    });

    this.page = await context.newPage();

    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
    });
  }

  async navigateToSite() {
    console.log('📍 Navigating to', CONFIG.url);

    // Try multiple strategies to load the page
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`⏳ Navigation attempt ${attempts}/${maxAttempts}...`);

        // Try with longer timeout and different wait strategies
        await this.page.goto(CONFIG.url, {
          waitUntil: 'domcontentloaded', // Less strict than networkidle
          timeout: 60000 // Increased to 60 seconds
        });

        // Wait a bit for any dynamic content
        await this.randomDelay(3000, 5000);

        const currentUrl = this.page.url();
        const title = await this.page.title();
        console.log('✅ Page loaded successfully');
        console.log('📍 Current URL:', currentUrl);
        console.log('📄 Page title:', title);
        return;

      } catch (error) {
        console.log(`⚠️  Attempt ${attempts} failed: ${error.message}`);

        if (attempts < maxAttempts) {
          console.log(`⏳ Retrying in 10 seconds...`);
          await this.randomDelay(10000, 15000);
        } else {
          throw new Error(`Failed to load page after ${maxAttempts} attempts`);
        }
      }
    }
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

      const currentUrl = this.page.url();
      const title = await this.page.title();
      console.log('✅ Login successful');
      console.log('📍 Current URL:', currentUrl);
      console.log('📄 Page title:', title);

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

          const currentUrl = this.page.url();
          const title = await this.page.title();
          console.log('📍 Current URL:', currentUrl);
          console.log('📄 Page title:', title);
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

          const currentUrl = this.page.url();
          const title = await this.page.title();
          console.log('📍 Current URL:', currentUrl);
          console.log('📄 Page title:', title);
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
      // Get page context
      const currentUrl = this.page.url();
      const title = await this.page.title();
      console.log('📍 Checking availability at URL:', currentUrl);
      console.log('📄 Page title:', title);

      // Look for availability indicators
      const content = await this.page.content();
      const visibleText = await this.page.textContent('body').catch(() => '');

      console.log('📊 Page content length:', content.length, 'characters');
      console.log('📝 Visible text length:', visibleText.length, 'characters');

      // Log a snippet of visible text for debugging
      const textSnippet = visibleText.substring(0, 500).replace(/\s+/g, ' ').trim();
      console.log('📖 Text snippet (first 500 chars):', textSnippet);

      // Check for common availability patterns
      const availabilityPatterns = [
        { pattern: /disponibil/i, name: 'disponibil (available in Italian)' },
        { pattern: /available/i, name: 'available' },
        { pattern: /prenota/i, name: 'prenota (book in Italian)' },
        { pattern: /book now/i, name: 'book now' },
        { pattern: /slot.*available/i, name: 'slot available' }
      ];

      console.log('🔍 Checking for availability patterns...');
      for (const { pattern, name } of availabilityPatterns) {
        if (pattern.test(content)) {
          const match = content.match(pattern);
          const matchContext = this.getMatchContext(content, match.index, 100);
          console.log(`✅ MATCH FOUND: "${name}"`);
          console.log(`📌 Matched text: "${match[0]}"`);
          console.log(`📍 Context: "...${matchContext}..."`);
          console.log('🎉 AVAILABILITY FOUND!');
          await this.takeScreenshot('availability-found');

          // Return detailed availability info for notifications
          return {
            found: true,
            url: currentUrl,
            pageTitle: title,
            matchedText: match[0],
            context: matchContext,
            patternName: name
          };
        }
      }

      console.log('❌ No availability patterns matched');

      // Check for "no availability" messages
      const noAvailabilityPatterns = [
        { pattern: /non.*disponibil/i, name: 'non disponibil' },
        { pattern: /no.*available/i, name: 'no available' },
        { pattern: /nessun.*appuntamento/i, name: 'nessun appuntamento' },
        { pattern: /no.*appointment/i, name: 'no appointment' }
      ];

      console.log('🔍 Checking for "no availability" patterns...');
      for (const { pattern, name } of noAvailabilityPatterns) {
        if (pattern.test(content)) {
          const match = content.match(pattern);
          const matchContext = this.getMatchContext(content, match.index, 100);
          console.log(`✅ MATCH FOUND: "${name}"`);
          console.log(`📌 Matched text: "${match[0]}"`);
          console.log(`📍 Context: "...${matchContext}..."`);
          console.log('❌ No appointments available');
          return { found: false };
        }
      }

      console.log('⚠️  Could not determine availability - no patterns matched');
      console.log('💡 This might mean:');
      console.log('   - The page structure is different than expected');
      console.log('   - Need to click more buttons to see availability');
      console.log('   - The selectors need updating');
      await this.takeScreenshot('availability-unknown');
      return { found: false };

    } catch (error) {
      console.error('❌ Error checking availability:', error.message);
      console.error('📍 Stack trace:', error.stack);
      return { found: false };
    }
  }

  getMatchContext(text, index, contextLength) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + contextLength);
    return text.substring(start, end).replace(/\s+/g, ' ').trim();
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

      const availabilityResult = await this.checkAvailability();

      if (availabilityResult.found) {
        console.log('🎉 SUCCESS! Appointment available!');
        console.log('⏸️  Browser will remain open for manual booking');

        // Send notification with detailed information
        await this.sendNotification('Appointment available!', {
          url: availabilityResult.url,
          pageTitle: availabilityResult.pageTitle,
          matchedText: availabilityResult.matchedText,
          context: availabilityResult.context
        });

        return true;
      } else {
        console.log('⏳ No appointments available, will retry...');
        // Don't send notification for "no availability"
        return false;
      }

    } catch (error) {
      console.error('❌ Bot error:', error.message);
      await this.takeScreenshot('error');
      throw error;
    }
  }

  async sendNotification(message, details = {}) {
    console.log('📢 Sending notifications...');

    const notificationData = {
      message,
      url: details.url || this.page?.url(),
      timestamp: new Date().toISOString(),
      pageTitle: details.pageTitle || '',
      matchedText: details.matchedText || '',
      context: details.context || ''
    };

    // Try all configured notification methods
    const notifications = [];

    // 1. Webhook notification (Slack, Discord, etc.)
    if (process.env.WEBHOOK_URL) {
      notifications.push(this.sendWebhookNotification(notificationData));
    }

    // 2. Email notification
    if (process.env.EMAIL_TO && process.env.EMAIL_FROM) {
      notifications.push(this.sendEmailNotification(notificationData));
    }

    // 3. SMS notification (Twilio)
    if (process.env.TWILIO_PHONE_TO && process.env.TWILIO_PHONE_FROM) {
      notifications.push(this.sendSMSNotification(notificationData));
    }

    // 4. Telegram notification
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      notifications.push(this.sendTelegramNotification(notificationData));
    }

    if (notifications.length === 0) {
      console.log('⚠️  No notification methods configured');
      console.log('💡 Set WEBHOOK_URL, EMAIL credentials, TWILIO credentials, or TELEGRAM credentials in environment variables');
      return;
    }

    const results = await Promise.allSettled(notifications);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Notifications sent: ${successful} successful, ${failed} failed`);
  }

  async sendWebhookNotification(data) {
    try {
      const fetch = (await import('node-fetch')).default;

      // Format for common webhook services
      const payload = {
        text: `🎉 ${data.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🎉 ${data.message}*`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*URL:*\n${data.url}`
              },
              {
                type: 'mrkdwn',
                text: `*Time:*\n${new Date(data.timestamp).toLocaleString()}`
              }
            ]
          }
        ]
      };

      if (data.matchedText) {
        payload.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Matched Text:*\n\`${data.matchedText}\``
          }
        });
      }

      if (data.context) {
        payload.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Context:*\n\`\`\`${data.context}\`\`\``
          }
        });
      }

      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ Webhook notification sent');
    } catch (error) {
      console.error('❌ Failed to send webhook notification:', error.message);
      throw error;
    }
  }

  async sendEmailNotification(data) {
    try {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const emailBody = `
        <h2>🎉 ${data.message}</h2>
        <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
        <p><strong>URL:</strong> <a href="${data.url}">${data.url}</a></p>
        ${data.pageTitle ? `<p><strong>Page Title:</strong> ${data.pageTitle}</p>` : ''}
        ${data.matchedText ? `<p><strong>Matched Text:</strong> <code>${data.matchedText}</code></p>` : ''}
        ${data.context ? `<p><strong>Context:</strong></p><pre>${data.context}</pre>` : ''}
        <hr>
        <p><em>Sent by Prenotami Booking Bot</em></p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `🎉 ${data.message}`,
        html: emailBody
      });

      console.log('✅ Email notification sent');
    } catch (error) {
      console.error('❌ Failed to send email notification:', error.message);
      throw error;
    }
  }

  async sendSMSNotification(data) {
    try {
      const twilio = require('twilio');

      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const smsBody = `🎉 ${data.message}\n\nURL: ${data.url}\nTime: ${new Date(data.timestamp).toLocaleString()}`;

      await client.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_FROM,
        to: process.env.TWILIO_PHONE_TO
      });

      console.log('✅ SMS notification sent');
    } catch (error) {
      console.error('❌ Failed to send SMS notification:', error.message);
      throw error;
    }
  }

  async sendTelegramNotification(data) {
    try {
      const fetch = (await import('node-fetch')).default;

      const message = `
🎉 *${data.message}*

*URL:* ${data.url}
*Time:* ${new Date(data.timestamp).toLocaleString()}
${data.pageTitle ? `*Page:* ${data.pageTitle}` : ''}
${data.matchedText ? `*Matched:* \`${data.matchedText}\`` : ''}
${data.context ? `\n\`\`\`\n${data.context}\n\`\`\`` : ''}
      `.trim();

      const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      console.log('✅ Telegram notification sent');
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error.message);
      throw error;
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
      const maxRetriesDisplay = CONFIG.maxRetries === Infinity ? '∞' : CONFIG.maxRetries;
      console.log(`\n🔄 Attempt ${bot.retryCount + 1}/${maxRetriesDisplay}`);
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
    if (CONFIG.maxRetries === Infinity) {
      console.log('⚠️  Bot stopped without finding appointment (unexpected exit from infinite loop)');
    } else {
      console.log('❌ Max retries reached. Exiting...');
    }
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
