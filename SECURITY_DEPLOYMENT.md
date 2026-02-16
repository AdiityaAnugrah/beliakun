# CRITICAL Security Fixes - Deployment Guide

## ⚠️ IMMEDIATE ACTIONS REQUIRED

Before deploying these security fixes to production, you MUST complete these steps:

### 1. Generate New JWT Secrets

```bash
cd backend
node scripts/generateSecrets.js
```

Copy the generated secrets and update your `.env` file:
- Replace `JWT_SECRET` with the new value
- Replace `REFRESH_SECRET` with the new value

**NOTE:** All existing user sessions will be invalidated. Users will need to log in again.

---

### 2. Rotate ALL API Keys

The following secrets were exposed in the repository and MUST be rotated:

#### Cloudflare Turnstile
- Login to Cloudflare Dashboard
- Generate new site key and secret key
- Update `TURNSTILE_SECRET_KEY` in `.env`

#### OpenAI API
- Login to OpenAI platform
- Revoke current key: `sk-proj-1HkB2Rn88SYpFURgWMOuED33vpC8V...`
- Generate new API key
- Update `BOT_API_KEY` in `.env`

#### Google Gemini API
- Login to Google AI Studio
- Revoke current key: `AIzaSyDDFxhkrBQ1g5csZmvVfDJ5gYK0t3qhkNs`
- Generate new API key
- Update `GEMINI_API_KEY` in `.env`

#### Tripay Payment Gateway
- Login to Tripay dashboard
- Revoke and regenerate API keys
- Update `TRIPAY_API_KEY` and `TRIPAY_PRIVATE_KEY` in `.env`

#### Telegram Bots
- Message @BotFather on Telegram
- Revoke current tokens for ALL bots
- Generate new tokens
- Update `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_TOKEN_GAMEPASS`, etc.

#### RBXCave API
- Login to RBXCave
- Generate new API key
- Update `RBXCAVE_API_KEY` in `.env`

#### Discord Webhooks
- Delete current webhook
- Create new webhook
- Update `DISCORD_WEBHOOK_URL` in `.env`

#### Gmail App Password
- Login to Google Account
- Revoke current app password
- Generate new app password
- Update `EMAIL_PASS` in `.env`

---

### 3. Clean Git History (If Pushed to Remote)

If you've already pushed `.env` to a public repository:

1. **Change repository to private immediately**
2. **Use BFG Repo-Cleaner or git-filter-repo:**

```bash
# Using BFG (recommended)
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

3. **Consider creating NEW repository and migrating code**

**⚠️ WARNING:** Cleaning git history is complex and can break things. Backup first!

---

### 4. Install New Dependencies

```bash
# Backend
cd backend
npm install

# WebSocket
cd ../websocket
npm install
```

---

### 5. Update Environment Variables

Create production `.env` file with:
- All new secrets from steps 1-2
- Production database credentials
- Production frontend URL
- Set `NODE_ENV=production`

---

### 6. Frontend WebSocket Client Update

Update frontend to pass JWT token when connecting to WebSocket:

```javascript
// Example: Update WebSocket connection
const token = localStorage.getItem('token'); // or wherever you store JWT
const ws = new WebSocket(`ws://your-domain.com:8000?token=${token}`);

ws.onopen = () => {
  console.log('Connected to secure WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'error') {
    console.error('WebSocket error:', data.message);
  }
  // Handle other message types
};
```

---

### 7. Test Everything

Before deploying to production:

1. **Test locally with new secrets:**
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # WebSocket (in separate terminal)
   cd websocket
   node server.js
   
   # Frontend (in separate terminal)
   cd frontend
   npm run dev
   ```

2. **Test rate limiting:**
   - Try logging in 6 times rapidly (should be blocked)
   - Try sending 11 AI requests in 1 minute (should be blocked)
   - Try WebSocket without token (should be rejected)

3. **Test WebSocket auth:**
   - Connect without token → should fail
   - Connect with invalid token → should fail
   - Connect with valid token → should succeed

---

### 8. Deploy to Production

1. Update production environment variables
2. Restart all services:
   ```bash
   pm2 restart backend
   pm2 restart websocket
   ```

3. Monitor logs for errors:
   ```bash
   pm2 logs backend
   pm2 logs websocket
   ```

---

## What Changed - Summary

### ✅ Fixed Issues:
1. **Hardcoded secrets removed** - Now uses environment variables
2. **Weak JWT secret** - Ready to use 256-bit secrets
3. **No rate limiting** - Added to auth, AI, and verification endpoints
4. **Insecure WebSocket** - Added JWT auth, validation, rate limiting
5. **Missing security headers** - Added Helmet.js

### 📁 Files Modified:
- `backend/.env.example` (NEW)
- `backend/controllers/authController.js`
- `backend/middleware/rateLimiter.js` (NEW)
- `backend/routes/authRoutes.js`
- `backend/routes/chatgptRoutes.js`
- `backend/routes/geminiRoutes.js`
- `backend/server.js`
- `backend/scripts/generateSecrets.js` (NEW)
- `websocket/server.js`

### ⚙️ New Dependencies:
- `helmet` (backend)
- `jsonwebtoken` (websocket)

---

## Post-Deployment Monitoring

Monitor for these potential issues:

1. **Rate limit false positives**
   - Users behind shared IPs might hit limits faster
   - Adjust limits if needed in `middleware/rateLimiter.js`

2. **WebSocket connection failures**
   - Check that frontend correctly passes JWT token
   - Verify JWT_SECRET matches between backend and websocket

3. **npm audit warnings**
   - Backend has 10 vulnerabilities (6 high, 1 critical)
   - Run `npm audit fix` to resolve

---

## Next Steps (Phase 2+)

After deployment, schedule these improvements:

1. **HIGH Priority:**
   - Input validation (Joi)
   - CSRF protection
   - Logging system (Winston)

2. **MEDIUM Priority:**
   - Refresh token implementation
   - Database backup automation
   - Health check endpoints

3. **LONG TERM:**
   - API documentation
   - TypeScript migration
   - End-to-end testing

---

## Support

If you encounter issues during deployment:
1. Check logs first: `pm2 logs`
2. Verify environment variables: `printenv | grep JWT`
3. Test individual components separately
4. Roll back if critical issues occur

**Remember:** Security is an ongoing process. Review and update regularly! 🔒
