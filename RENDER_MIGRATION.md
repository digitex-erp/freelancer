# 🚀 Render.com Migration Guide
## Freelancer AI Agent - Complete Setup

---

## ✅ Why Render is Better Than Vercel

| Feature | Vercel (Current) | Render.com (New) |
|---------|-----------------|------------------|
| **Serverless Functions** | ❌ 12 max (we hit limit) | ✅ **UNLIMITED** |
| **Free Tier** | Limited | ✅ 750 hours/month |
| **Cron Jobs** | Yes | ✅ Yes (better) |
| **Build Time** | 6000 min/month | ✅ 500 min/month |
| **Setup Complexity** | Medium | 🟢 Easy |
| **No Credit Card** | Required | ✅ Not Required |

---

## 📋 What You'll Need

1. ✅ GitHub account with your code
2. ✅ Render.com account (free - create at render.com)
3. ✅ Neon Database URL (you already have this)
4. ✅ Gemini API key (you already have this)

---

## 🎯 Step-by-Step Migration (15 minutes)

### **STEP 1: Create Render Account**

1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (easiest) or email
4. ✅ No credit card required!

---

### **STEP 2: Push Code to GitHub**

**Option A: Create New Repository**
1. Go to: https://github.com/new
2. Name: `freelancer-ai-agent` (or any name)
3. Make it **Public** or **Private** (your choice)
4. Click "Create repository"
5. Upload your project files via GitHub website

**Option B: Use Existing Repository**
- If you already have the code in GitHub, skip to Step 3!

---

### **STEP 3: Create Web Service on Render**

1. Log into Render Dashboard: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"**
4. Select your GitHub repository
5. Fill in the details:

```
Name: freelancer-ai-agent
Runtime: Node
Branch: main
Build Command: npm install && npm run build
Start Command: node server.js
```

6. Scroll down to **"Environment Variables"** and add:

```
DATABASE_URL = your_neon_database_url
GEMINI_API_KEY = your_gemini_api_key
```

7. Click **"Create Web Service"** ✅

**Wait 3-5 minutes** for the first deployment!

---

### **STEP 4: Set Up Cron Job**

1. In Render Dashboard, click **"New +"** → **"Cron Job"**
2. Select same repository
3. Fill in:

```
Name: fetch-leads-daily
Schedule: 0 8 * * *
Build Command: npm install
Start Command: node -e "import('./api/cron/fetch-leads.js').then(m => m.default())"
```

4. Add same environment variables:
```
DATABASE_URL = your_neon_database_url
GEMINI_API_KEY = your_gemini_api_key
```

5. Click **"Create Cron Job"** ✅

---

### **STEP 5: Test Your Deployment**

After deployment completes, you'll get a URL like:
```
https://freelancer-ai-agent-xxxx.onrender.com
```

**Test these endpoints:**

1. **Health Check:**
   ```
   https://your-app.onrender.com/api/health
   ```
   Should see: `{"ok": true, "checks": {...}}`

2. **Setup Database:**
   ```
   https://your-app.onrender.com/api/setup-db
   ```
   Should see: `{"ok": true, "message": "Database initialized"}`

3. **Dashboard:**
   ```
   https://your-app.onrender.com
   ```
   Should see: Bell24h AI Agent interface

---

## 🎨 Add Custom Domain (Optional)

1. In Render Dashboard → Your Web Service
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `agent.yourdomain.com`)
5. Update your DNS records as shown
6. ✅ Free SSL certificate included!

---

## ⚙️ Environment Variables Guide

| Variable | Required? | Where to Get It |
|----------|-----------|----------------|
| `DATABASE_URL` | ✅ Yes | Neon Dashboard → Connection String |
| `GEMINI_API_KEY` | ✅ Yes | https://makersuite.google.com/app/apikey |
| `API_KEY` | 🟡 Optional | Same as GEMINI_API_KEY (fallback) |
| `OPENAI_API_KEY` | 🟡 Optional | https://platform.openai.com/api-keys |
| `ANTHROPIC_API_KEY` | 🟡 Optional | https://console.anthropic.com |

---

## 🔧 Troubleshooting

### **Build Failed?**

**Check Node Version:**
- Render Dashboard → Settings
- Add env var: `NODE_VERSION = 20.11.1`

**Check Build Logs:**
- Click on your service
- Go to "Logs" tab
- Look for red error messages

### **Database Connection Failed?**

**Verify DATABASE_URL:**
1. Should look like: `postgresql://user:password@host/database?sslmode=require`
2. Make sure `?sslmode=require` is at the end
3. Test connection from Neon dashboard first

### **Cron Job Not Running?**

**Check Cron Logs:**
- Render Dashboard → Cron Jobs → Your Job
- Click "Logs"
- Verify it's running at scheduled time

---

## 📊 Render vs Vercel - Migration Summary

### **What Changed:**
- ✅ Added `render.yaml` configuration
- ✅ Added `server.js` for Express server
- ✅ No more function limits!
- ✅ Same codebase, better platform

### **What Stayed the Same:**
- ✅ All API routes work identically
- ✅ Same database (Neon)
- ✅ Same AI integration
- ✅ Same frontend

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Dashboard loads at your Render URL
- [ ] `/api/health` returns healthy status
- [ ] `/api/setup-db` initializes database
- [ ] `/api/leads` returns lead data
- [ ] Cron job shows in Render dashboard
- [ ] Can manually trigger cron from dashboard
- [ ] Environment variables are set
- [ ] Custom domain works (if configured)

---

## 🚀 You're Live!

**Your site is now running on Render!**

- ✅ No serverless function limits
- ✅ Free SSL certificate
- ✅ Auto-deploy from GitHub
- ✅ Built-in monitoring
- ✅ Better performance

**Next time you update code:**
1. Push to GitHub
2. Render auto-deploys
3. That's it! ✅

---

## 📞 Need Help?

**Render Documentation:** https://render.com/docs  
**Support:** https://render.com/support

**Common Issues:**
- Build failing → Check `package.json` scripts
- 500 errors → Check environment variables
- Database errors → Verify `DATABASE_URL`

---

**Congratulations!** 🎊 You've successfully migrated to Render.com!
