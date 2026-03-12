# Quick Start Guide

## Local Testing (5 minutes)

### Step 1: Install
```bash
cd prenotami-booking-bot
npm install
```

### Step 2: Configure
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```
USERNAME=your_email@example.com
PASSWORD=your_password
```

### Step 3: Test Run (with visible browser)
```bash
npm run dev
```

Watch the browser to see if the bot works correctly. If it fails at any step, proceed to Step 4.

### Step 4: Inspect and Fix Selectors (if needed)
```bash
npm run inspect
```

This opens the website with DevTools. Find the correct selectors for:
- Login button
- Username field
- Password field
- Book/Prenota button
- Schengen link

Update these selectors in `bot.js`.

### Step 5: Production Run
```bash
npm start
```

---

## Railway Deployment (10 minutes)

### Option A: Using Railway CLI

1. **Install CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize:**
```bash
cd prenotami-booking-bot
railway init
```

4. **Set Variables:**
```bash
railway variables set USERNAME=your_email@example.com
railway variables set PASSWORD=your_password
railway variables set HEADLESS=true
railway variables set CHECK_INTERVAL=60000
railway variables set MAX_RETRIES=100
```

5. **Deploy:**
```bash
railway up
```

6. **View Logs:**
```bash
railway logs
```

### Option B: Using Railway Dashboard

1. Push code to GitHub
2. Go to https://railway.app
3. "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables in "Variables" tab
6. Click "Deploy"

---

## Adding Notifications

To get notified when appointments are found:

### Slack
1. Create webhook: https://api.slack.com/messaging/webhooks
2. Add to `.env`:
```
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Discord
1. Server Settings → Integrations → Webhooks → New Webhook
2. Add to `.env`:
```
WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't find elements | Run `npm run inspect` and update selectors |
| Login fails | Check credentials, may need CAPTCHA solving |
| Railway deployment fails | Check logs with `railway logs` |
| Out of memory on Railway | Reduce `MAX_RETRIES` or increase Railway plan |

---

## Next Steps

1. ✅ Test locally first
2. ✅ Verify it works end-to-end
3. ✅ Add webhook for notifications
4. ✅ Deploy to Railway
5. ✅ Monitor logs to ensure it's working
6. 📱 Book your appointment when notified!

---

## Support

- Check `README.md` for detailed documentation
- Review screenshots taken by the bot
- Check Railway logs for deployment issues
