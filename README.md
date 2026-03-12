# Prenotami Booking Bot

Automated bot for booking appointments on [prenotami.esteri.it](https://prenotami.esteri.it/) - the Italian government's appointment booking system for visa and consular services.

## Features

- Automated login and navigation
- Continuous checking for appointment availability
- Schengen visa appointment booking support
- Screenshot capture at each step for debugging
- Configurable retry intervals
- Optional webhook notifications (Slack, Discord, Telegram, etc.)
- Railway deployment ready

## Prerequisites

- Node.js 18 or higher
- Account credentials for prenotami.esteri.it
- (Optional) Railway account for cloud deployment

## Local Setup

### 1. Clone or Download

```bash
cd prenotami-booking-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
USERNAME=your_email@example.com
PASSWORD=your_password
HEADLESS=true
CHECK_INTERVAL=60000
MAX_RETRIES=100
```

### 4. Run Locally

For development (visible browser):
```bash
npm run dev
```

For production (headless):
```bash
npm start
```

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `USERNAME` | Your prenotami.esteri.it username/email | (required) |
| `PASSWORD` | Your prenotami.esteri.it password | (required) |
| `HEADLESS` | Run browser in headless mode | `true` |
| `CHECK_INTERVAL` | Time between checks in milliseconds | `60000` (1 min) |
| `MAX_RETRIES` | Maximum number of retry attempts | `100` |
| `WEBHOOK_URL` | Webhook URL for notifications (optional) | - |

## Railway Deployment

### Method 1: Using Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Set environment variables:
```bash
railway variables set USERNAME=your_email@example.com
railway variables set PASSWORD=your_password
railway variables set HEADLESS=true
railway variables set CHECK_INTERVAL=60000
railway variables set MAX_RETRIES=100
```

5. Deploy:
```bash
railway up
```

### Method 2: Using Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables in the "Variables" tab:
   - `USERNAME`
   - `PASSWORD`
   - `HEADLESS=true`
   - `CHECK_INTERVAL=60000`
   - `MAX_RETRIES=100`
5. Deploy

### Method 3: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

After deployment, add your environment variables in the Railway dashboard.

## How It Works

1. **Initialize**: Launches a Chromium browser instance
2. **Navigate**: Goes to prenotami.esteri.it
3. **Login**: Fills in credentials and logs in
4. **Navigate to Booking**: Clicks on "Book/Prenota" button
5. **Select Service**: Clicks on Schengen visa appointment link
6. **Check Availability**: Scans page for available appointments
7. **Notify**: If appointment found, sends notification (if configured)
8. **Retry**: If no appointments, waits and retries

## Screenshots

The bot automatically takes screenshots at each step:
- `screenshot-initial-page-*.png`
- `screenshot-after-login-*.png`
- `screenshot-after-book-click-*.png`
- `screenshot-after-schengen-select-*.png`
- `screenshot-availability-found-*.png` (if found)
- `screenshot-error-*.png` (if error occurs)

## Webhook Notifications

To receive notifications when an appointment is found, set the `WEBHOOK_URL` environment variable.

### Slack Webhook Example

1. Create a Slack webhook: https://api.slack.com/messaging/webhooks
2. Set the webhook URL:
```bash
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Discord Webhook Example

1. Create a Discord webhook in your channel settings
2. Set the webhook URL:
```bash
WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

## Customization

If the website structure changes or if selectors don't match, you need to update the selectors in `bot.js`:

### Finding Correct Selectors

1. Run the bot locally with `HEADLESS=false`:
```bash
npm run dev
```

2. Open the browser developer tools (F12)
3. Inspect the elements you want to interact with
4. Update the selectors in `bot.js`:
   - `loginSelectors` - for login buttons
   - `usernameSelectors` - for username/email fields
   - `passwordSelectors` - for password fields
   - `bookSelectors` - for book/prenota buttons
   - `schengenSelectors` - for Schengen appointment links

## Troubleshooting

### Bot can't find login button
- Run with `HEADLESS=false` to see what's happening
- Check the screenshots in the project directory
- Update the `loginSelectors` array in `bot.js`

### Login fails
- Verify your credentials in `.env`
- Check if the website requires CAPTCHA
- Update username/password selectors if needed

### Can't find Schengen link
- The link text might be different
- Update `schengenSelectors` in `bot.js`
- Check the screenshot to see what's on the page

### Railway deployment fails
- Check Railway logs: `railway logs`
- Verify all environment variables are set
- Ensure Dockerfile has all necessary dependencies

## Important Notes

⚠️ **Ethical Usage**: This bot is for personal use to book your own appointments. Do not use it to:
- Make multiple bookings
- Book appointments you don't intend to use
- Overwhelm the government website
- Resell appointment slots

⚠️ **Terms of Service**: Check prenotami.esteri.it's terms of service before using this bot. Automated access may be against their terms.

⚠️ **CAPTCHA**: If the website implements CAPTCHA, this bot won't work automatically and will require manual intervention.

⚠️ **Rate Limiting**: The bot includes delays to be respectful to the server. Don't decrease `CHECK_INTERVAL` below 30 seconds.

## License

MIT License - Use at your own risk

## Disclaimer

This bot is provided as-is for educational purposes. The author is not responsible for any misuse or violations of the website's terms of service. Use responsibly and ethically.
