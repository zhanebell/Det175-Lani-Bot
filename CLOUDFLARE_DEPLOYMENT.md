# Cloudflare Pages Deployment Guide

## Setup Steps

### 1. Connect Repository
1. Go to Cloudflare Dashboard > Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Select the repository

### 2. Configure Build Settings

**Framework preset:** None (Custom)

**Build command:**
```bash
cd frontend && npm ci && npm run build
```

**Build output directory:**
```
frontend/dist
```

**Root directory:**
```
/
```

### 3. Environment Variables

Add these in Cloudflare Pages settings:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://your-cloud-run-url.run.app` | Your Cloud Run backend URL |
| `NODE_VERSION` | `18` | Optional, ensures correct Node version |

### 4. Custom Domain (Optional)

1. Go to Pages project > Custom domains
2. Add your domain (e.g., `lanibot.yourdomain.com`)
3. Follow DNS instructions
4. Update `ALLOWED_ORIGINS` in backend to include your domain

### 5. Deploy

- Push to `main` branch triggers automatic deployment
- Check build logs for any errors
- Test the deployed site

### 6. Turnstile Setup

1. Go to Cloudflare > Turnstile
2. Create a new site
3. Add your Pages domain
4. Copy the **Site Key** (for frontend HTML)
5. Copy the **Secret Key** (for backend env)
6. Update `index.html` with your site key:
   ```html
   <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
   ```

### 7. CORS Configuration

Make sure your backend `ALLOWED_ORIGINS` includes:
```
https://yourproject.pages.dev,https://lanibot.yourdomain.com
```

## Troubleshooting

### Build fails
- Check Node version is 18+
- Verify `package.json` scripts
- Check build logs for errors

### Can't connect to backend
- Verify `VITE_API_URL` is correct
- Check backend CORS settings
- Test backend health: `curl https://your-backend.run.app/health`

### Turnstile not working
- Verify site key in HTML
- Check domain is added to Turnstile site
- Ensure backend has correct secret

## Performance Optimization

1. **Caching:**
   - Pages automatically caches static assets
   - Set appropriate cache headers

2. **Compression:**
   - Brotli/Gzip enabled by default

3. **CDN:**
   - Cloudflare's global CDN ensures fast delivery

## Security

1. **HTTPS:**
   - Automatic via Cloudflare

2. **Headers:**
   - Add custom headers in Pages settings if needed:
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`

3. **Bot Protection:**
   - Turnstile provides CAPTCHA
   - Enable "Bot Fight Mode" in Cloudflare

## Cost

- **Cloudflare Pages:** FREE (unlimited bandwidth)
- **Custom domain:** Varies by registrar
- **Turnstile:** FREE (up to 1M requests/month)

## CI/CD

Automatic deployment on push to `main`:
```
GitHub Push → Cloudflare Detects → Build → Deploy
```

No additional configuration needed beyond initial setup!
