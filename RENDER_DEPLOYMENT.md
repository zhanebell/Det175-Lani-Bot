# Render.com Deployment Guide

This guide walks you through deploying the Det 175 Lani Bot to Render.com - a free, easy-to-use platform that requires no command-line tools.

## 🎯 Why Render?

- ✅ **Free tier available** - Perfect for this project
- ✅ **Always-on** - No cold starts, instant page loads
- ✅ **Custom domains** - Easy to add your own domain
- ✅ **Auto-deploy from GitHub** - Set it and forget it
- ✅ **Built-in SSL** - Free HTTPS certificates
- ✅ **No credit card required** for free tier

---

## 📋 Prerequisites

1. ✅ GitHub repository created (Done! `zhanebell/Det175-Lani-Bot`)
2. ✅ Code pushed to GitHub (Done!)
3. ⬜ Render.com account (we'll create this now)
4. ⬜ Groq API Key (you should have this)

---

## 🚀 Step 1: Deploy Backend to Render

### 1.1 Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (easiest option)
4. Authorize Render to access your GitHub repositories

### 1.2 Create Web Service for Backend

1. **From Render Dashboard**, click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Click **"Connect account"** if needed
   - Find and select **`zhanebell/Det175-Lani-Bot`**
   - Click **"Connect"**

3. **Configure Service:**
   
   **Name:** `lani-bot-backend` (or your preferred name)
   
   **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
   
   **Branch:** `main`
   
   **Root Directory:** `backend`
   
   **Runtime:** `Docker`
   
   **Instance Type:** `Free` ⭐

4. **Environment Variables** - Click "Advanced" and add:
   
   | Key | Value |
   |-----|-------|
   | `GROQ_API_KEY` | `your-groq-api-key-here` |
   | `ALLOWED_ORIGINS` | `https://your-frontend-url.onrender.com` (we'll update this after deploying frontend) |
   | `TURNSTILE_SECRET` | `test-secret` (for now, update later for production) |
   | `PORT` | `8080` |

5. **Click "Create Web Service"**

6. **Wait for deployment** (3-5 minutes)
   - You'll see build logs in real-time
   - Look for: `Your service is live 🎉`

7. **Copy your backend URL** (e.g., `https://lani-bot-backend.onrender.com`)

---

## 🎨 Step 2: Deploy Frontend to Render

### 2.1 Create Static Site for Frontend

1. **From Render Dashboard**, click **"New +"** → **"Static Site"**

2. **Connect Repository:**
   - Select **`zhanebell/Det175-Lani-Bot`** (already connected)
   - Click **"Connect"**

3. **Configure Static Site:**
   
   **Name:** `lani-bot-frontend` (or your preferred name)
   
   **Branch:** `main`
   
   **Root Directory:** `frontend`
   
   **Build Command:** `npm install && npm run build`
   
   **Publish Directory:** `dist`

4. **Environment Variables** - Add:
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://lani-bot-backend.onrender.com` (your backend URL from Step 1.7) |
   | `VITE_TURNSTILE_SITE_KEY` | (leave empty for now, add later when configuring Turnstile) |

5. **Click "Create Static Site"**

6. **Wait for deployment** (2-3 minutes)

7. **Your frontend is now live!** 🎉
   - URL will be like: `https://lani-bot-frontend.onrender.com`

---

## 🔄 Step 3: Update Backend CORS

Now that your frontend is deployed, update the backend to allow requests from it:

1. Go to **Render Dashboard** → **lani-bot-backend**
2. Go to **"Environment"** tab
3. Edit **`ALLOWED_ORIGINS`**:
   - Change from: `https://your-frontend-url.onrender.com`
   - To: `https://lani-bot-frontend.onrender.com` (your actual frontend URL)
4. Click **"Save Changes"**
5. Render will automatically redeploy (takes ~1 minute)

---

## ✅ Step 4: Test Your Deployment

1. **Open your frontend URL** (e.g., `https://lani-bot-frontend.onrender.com`)
2. **Select LLABs** (e.g., LLAB 1, LLAB 2)
3. **Click "Start Session"**
4. **Type "yes"** and send
5. **Verify the bot responds** with a question

### Troubleshooting:

**If you see CORS errors:**
- Make sure `ALLOWED_ORIGINS` in backend matches your frontend URL exactly
- Check backend logs in Render dashboard

**If you see "Failed to fetch":**
- Verify `VITE_API_URL` in frontend points to your backend URL
- Check that backend is running (green status in Render dashboard)

---

## 🌐 Step 5: Add Custom Domain (Optional)

### For Frontend (User-facing URL):

1. **In Render Dashboard** → **lani-bot-frontend**
2. Go to **"Settings"** → **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `lanibot.yourdomain.com`)
5. **Add DNS records** at your domain registrar:
   - Type: `CNAME`
   - Name: `lanibot` (or `@` for root domain)
   - Value: `lani-bot-frontend.onrender.com`
6. Wait for DNS propagation (5-60 minutes)
7. Render will automatically provision SSL certificate

### Update Backend CORS:

After adding custom domain, update backend's `ALLOWED_ORIGINS`:
1. Go to backend service → Environment
2. Update `ALLOWED_ORIGINS` to: `https://lanibot.yourdomain.com,https://lani-bot-frontend.onrender.com`
3. Save changes

---

## 🔐 Step 6: Configure Cloudflare Turnstile (Optional)

For production bot protection:

1. **Get Turnstile Keys:**
   - Go to https://dash.cloudflare.com → Turnstile
   - Create new site
   - Add your custom domain
   - Copy **Site Key** and **Secret Key**

2. **Update Frontend:**
   - Render Dashboard → lani-bot-frontend → Environment
   - Set `VITE_TURNSTILE_SITE_KEY` = your site key
   - Save changes

3. **Update Backend:**
   - Render Dashboard → lani-bot-backend → Environment
   - Set `TURNSTILE_SECRET` = your secret key
   - Save changes

---

## 🔄 Auto-Deploy (Set and Forget!)

**Your app will automatically redeploy** when you push to GitHub:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Render detects the push and redeploys automatically
4. Check deployment progress in Render Dashboard

---

## 💰 Pricing & Limits

### Free Tier Includes:
- ✅ **Backend:** 750 hours/month (always on for 1 service)
- ✅ **Frontend:** Unlimited bandwidth for static sites
- ✅ **SSL:** Free HTTPS certificates
- ✅ **Auto-deploy:** Unlimited
- ✅ **Custom domains:** Unlimited

### Free Tier Limitations:
- ⚠️ Backend spins down after 15 min of inactivity (30-60s cold start)
- ⚠️ 512MB RAM for backend
- ⚠️ Shared CPU

### To Keep Backend Always-On:
- Upgrade to **Starter plan** ($7/month)
- Backend stays warm, no cold starts
- Better for production use

---

## 📊 Monitoring

### View Logs:
1. **Render Dashboard** → Your service
2. Click **"Logs"** tab
3. See real-time application logs

### View Metrics:
1. **Render Dashboard** → Your service
2. Click **"Metrics"** tab
3. See CPU, Memory, Request rates

### Health Checks:
- Backend: `https://your-backend.onrender.com/health`
- Should return: `{"ok":true,"service":"lani-bot-api"}`

---

## 🆘 Troubleshooting

### Backend Build Failed:
1. Check **Logs** tab for errors
2. Common issues:
   - Missing `GROQ_API_KEY` environment variable
   - Dockerfile syntax errors
   - Python dependency issues

### Frontend Build Failed:
1. Check **Logs** tab for errors
2. Common issues:
   - Missing `VITE_API_URL` environment variable
   - TypeScript errors
   - Missing npm dependencies

### App Not Loading:
1. Check backend status (should be green)
2. Check frontend status (should be green)
3. Verify CORS settings match
4. Check browser console for errors (F12)

### Cold Starts (Free Tier):
- Backend spins down after 15 min inactivity
- First request takes 30-60s to wake up
- Solution: Upgrade to Starter plan or use a ping service

---

## 📝 Summary Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Render
- [ ] Backend CORS configured with frontend URL
- [ ] Test chat functionality works
- [ ] (Optional) Custom domain added
- [ ] (Optional) Cloudflare Turnstile configured
- [ ] Auto-deploy enabled

---

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **Your GitHub Repo:** https://github.com/zhanebell/Det175-Lani-Bot
- **Backend Health:** `https://your-backend.onrender.com/health`
- **Frontend:** `https://your-frontend.onrender.com`

---

## 💡 Pro Tips

1. **Use Render's built-in metrics** to monitor usage
2. **Set up notification emails** in Render settings for deploy failures
3. **Keep your Groq API key secret** - never commit it to GitHub
4. **Test in production** after each deployment
5. **Monitor Groq API usage** to stay within limits

---

**Need Help?**
- Render Community: https://community.render.com
- Render Status: https://status.render.com
- Groq Docs: https://console.groq.com/docs

**🎉 Your Det 175 Lani Bot is now deployed and ready to help cadets study!**
