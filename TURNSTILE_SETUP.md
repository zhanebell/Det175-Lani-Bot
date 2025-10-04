# Cloudflare Turnstile Setup Guide

This guide explains how to configure Cloudflare Turnstile for bot protection in production.

## For Local Development (Current Setup)

**You don't need Turnstile configured for local development!** The app is already set up to bypass Turnstile when:

1. Frontend is in development mode (`npm run dev`)
2. Backend has `TURNSTILE_SECRET=test-secret` (already configured)

### Verify It's Working

1. **Start the backend** (should already be running):
   ```bash
   docker-compose up -d
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open the app**: http://localhost:5173

4. **Test the chat**: Select LLABs, start chatting - it should work without any Turnstile errors!

---

## For Production Deployment

### Step 1: Get Turnstile Keys from Cloudflare

1. Go to https://dash.cloudflare.com
2. Select your account
3. Navigate to **Turnstile** in the sidebar
4. Click **Add Site**
5. Configure:
   - **Site name**: `Lani Bot`
   - **Domains**: Add your frontend domain (e.g., `lani-bot.pages.dev`)
   - **Widget Mode**: Managed (Recommended)
   - **Pre-Clearance**: Off (unless you need it)
6. Click **Create**
7. Copy both keys:
   - **Site Key** (public, used in frontend)
   - **Secret Key** (private, used in backend)

### Step 2: Configure Backend (Cloud Run)

Add the secret to Google Secret Manager:

```bash
# Create secret
echo -n "your-turnstile-secret-key" | gcloud secrets create turnstile-secret \
  --data-file=- \
  --project=YOUR_PROJECT_ID

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding turnstile-secret \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Update Cloud Run service to use the secret:
```bash
gcloud run services update lani-bot-backend \
  --update-secrets=TURNSTILE_SECRET=turnstile-secret:latest \
  --region=us-central1
```

### Step 3: Configure Frontend (Cloudflare Pages)

1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add production variable:
   - **Name**: `VITE_TURNSTILE_SITE_KEY`
   - **Value**: Your site key from Step 1
   - **Environment**: Production
5. Save and redeploy

### Step 4: Add Turnstile Widget to Frontend (Optional - Manual Placement)

If you want more control over where the Turnstile widget appears, you can render it manually in `ChatInterface.tsx`:

```tsx
// Add this inside your component, below the input textarea
<div 
  className="cf-turnstile"
  data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
  data-theme="light"
  data-size="compact"
/>
```

**Current Implementation**: The app uses invisible/programmatic Turnstile, so you don't need a visible widget.

---

## Troubleshooting

### "Turnstile not initialized" Error

**In Development**: This shouldn't happen with the updated code. Make sure:
- Frontend `.env` has `VITE_API_URL=http://localhost:8080`
- Backend `.env` has `TURNSTILE_SECRET=test-secret`
- You've restarted both servers after `.env` changes

**In Production**: Make sure:
- `VITE_TURNSTILE_SITE_KEY` is set in Cloudflare Pages
- `TURNSTILE_SECRET` is set in Cloud Run (via Secret Manager)
- The site key domain matches your frontend domain

### "Turnstile verification failed" Error

- Check that your backend secret matches the one from Cloudflare
- Verify the site key domain is correct (must match your frontend URL)
- Check backend logs: `gcloud run logs read lani-bot-backend --limit=50`

### CORS Errors with Turnstile

Make sure your backend `ALLOWED_ORIGINS` includes your frontend domain:
```bash
gcloud run services update lani-bot-backend \
  --set-env-vars="ALLOWED_ORIGINS=https://your-frontend-domain.pages.dev" \
  --region=us-central1
```

---

## Testing Turnstile in Production

1. Deploy both backend and frontend
2. Open your production URL
3. Open browser DevTools (F12) > Network tab
4. Start a chat
5. Look for the `/chat` request - check the `X-Turnstile-Token` header
6. Backend logs should show "Turnstile verification successful"

---

## Security Notes

- **Never commit** `TURNSTILE_SECRET` to version control
- The secret key should only be in:
  - Local `.env` file (test-secret for dev)
  - Google Secret Manager (production)
- The site key is public and safe to include in frontend code
- Turnstile tokens are single-use and expire after ~5 minutes

---

## References

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Turnstile API Reference](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Google Secret Manager](https://cloud.google.com/secret-manager/docs)
