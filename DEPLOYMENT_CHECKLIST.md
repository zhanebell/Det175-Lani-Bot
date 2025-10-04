# 📋 Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment

### Google Cloud Setup
- [ ] Create GCP project
- [ ] Enable billing
- [ ] Enable required APIs:
  - [ ] Cloud Run API
  - [ ] Cloud Build API
  - [ ] Secret Manager API
  - [ ] Artifact Registry API
- [ ] Install and configure `gcloud` CLI
- [ ] Authenticate: `gcloud auth login`
- [ ] Set project: `gcloud config set project PROJECT_ID`

### Secrets Management
- [ ] Get Groq API key from [console.groq.com](https://console.groq.com/keys)
- [ ] Test Groq API key locally
- [ ] Create GCP secrets:
  ```bash
  echo -n "your_groq_key" | gcloud secrets create GROQ_API_KEY --data-file=-
  echo -n "your_turnstile_secret" | gcloud secrets create TURNSTILE_SECRET --data-file=-
  ```
- [ ] Grant Cloud Run access to secrets:
  ```bash
  gcloud secrets add-iam-policy-binding GROQ_API_KEY \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
  ```

### Cloudflare Setup
- [ ] Create Cloudflare account
- [ ] Add domain to Cloudflare (if using custom domain)
- [ ] Create Turnstile site:
  - [ ] Go to Turnstile dashboard
  - [ ] Create new site
  - [ ] Add your domain(s)
  - [ ] Copy Site Key (for frontend)
  - [ ] Copy Secret Key (for backend)
- [ ] Test Turnstile widget locally

## Backend Deployment

### Initial Deployment
- [ ] Update `PROJECT_ID` in commands
- [ ] Build Docker image:
  ```bash
  cd backend
  gcloud builds submit --tag gcr.io/PROJECT_ID/lani-bot-api
  ```
- [ ] Deploy to Cloud Run:
  ```bash
  gcloud run deploy lani-bot-api \
    --image gcr.io/PROJECT_ID/lani-bot-api \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --min-instances 0 \
    --max-instances 10 \
    --cpu 1 \
    --memory 512Mi \
    --timeout 60s \
    --concurrency 80 \
    --set-env-vars "ALLOWED_ORIGINS=https://yourdomain.com" \
    --set-secrets "GROQ_API_KEY=GROQ_API_KEY:latest,TURNSTILE_SECRET=TURNSTILE_SECRET:latest"
  ```
- [ ] Note the Cloud Run URL (e.g., `https://lani-bot-api-xxx.run.app`)
- [ ] Test health endpoint:
  ```bash
  curl https://YOUR_CLOUD_RUN_URL/health
  ```

### CI/CD Setup (Optional but Recommended)
- [ ] Set up Workload Identity Federation
- [ ] Add GitHub secrets:
  - [ ] `GCP_PROJECT_ID`
  - [ ] `WIF_PROVIDER`
  - [ ] `WIF_SERVICE_ACCOUNT`
  - [ ] `ALLOWED_ORIGINS`
- [ ] Test GitHub Actions workflow
- [ ] Verify auto-deployment works

## Frontend Deployment

### Cloudflare Pages Setup
- [ ] Go to Cloudflare Dashboard > Pages
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build command: `cd frontend && npm ci && npm run build`
  - Build output: `frontend/dist`
  - Root directory: `/`
- [ ] Add environment variable:
  - `VITE_API_URL`: Your Cloud Run URL
- [ ] Update Turnstile site key in `frontend/index.html`:
  ```html
  <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
  ```
- [ ] Deploy (automatic on push to main)
- [ ] Note the Pages URL (e.g., `https://lanibot.pages.dev`)

### Custom Domain (Optional)
- [ ] Add custom domain in Pages
- [ ] Update DNS records
- [ ] Verify SSL certificate
- [ ] Update `ALLOWED_ORIGINS` in backend to include custom domain

## Post-Deployment

### Backend Verification
- [ ] Test health endpoint: `curl https://YOUR_BACKEND_URL/health`
- [ ] Test CORS: Check browser console
- [ ] Verify rate limiting works (send >20 requests)
- [ ] Check Cloud Run logs for errors
- [ ] Verify cold start performance (<5s)
- [ ] Test with different LLAB selections

### Frontend Verification
- [ ] Open site in browser
- [ ] Test LLAB selection screen
- [ ] Start a session
- [ ] Send a test question
- [ ] Verify streaming works
- [ ] Test on mobile device
- [ ] Test dark/light mode toggle
- [ ] Check browser console for errors

### Security Checks
- [ ] HTTPS is enabled (automatic)
- [ ] CORS is working correctly
- [ ] Rate limiting is active
- [ ] Turnstile verification works
- [ ] No secrets exposed in client
- [ ] Backend doesn't expose sensitive info

### Performance Testing
- [ ] Run load test:
  ```bash
  cd tests
  k6 run --env API_URL=https://YOUR_BACKEND_URL load-test.js
  ```
- [ ] Check p95 latency < 1.5s
- [ ] Verify auto-scaling works
- [ ] Monitor cold start times

## Monitoring Setup

### Cloud Run Monitoring
- [ ] Set up logging
- [ ] Create alerts for:
  - [ ] High error rate (>5%)
  - [ ] High latency (p95 >2s)
  - [ ] Low memory
  - [ ] High CPU
- [ ] Set up uptime monitoring

### Cloudflare Analytics
- [ ] Enable Web Analytics
- [ ] Set up alerts for:
  - [ ] Site downtime
  - [ ] High error rates
  - [ ] Traffic spikes

### Optional: Sentry
- [ ] Create Sentry account
- [ ] Add DSN to backend and frontend
- [ ] Test error reporting

## Cost Management

### Expected Monthly Costs
- [ ] Cloudflare Pages: **FREE**
- [ ] Cloudflare Turnstile: **FREE** (up to 1M requests)
- [ ] Cloud Run: **~$5-15/month** (depends on traffic)
- [ ] Secret Manager: **~$1/month**
- [ ] Cloud Build: **FREE** (first 120 builds)

### Cost Optimization
- [ ] Set `min-instances=0` for auto-scaling to zero
- [ ] Monitor Cloud Run usage
- [ ] Set up billing alerts:
  ```bash
  gcloud alpha billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="Lani Bot Budget" \
    --budget-amount=50 \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90
  ```

## Final Checks

- [ ] All services are running
- [ ] Health checks pass
- [ ] Frontend loads correctly
- [ ] Chat works end-to-end
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Rate limiting works
- [ ] Turnstile verification works
- [ ] Streaming responses work
- [ ] Error handling works
- [ ] Documentation is updated
- [ ] Team has access credentials
- [ ] Monitoring is set up
- [ ] Costs are tracked

## Rollback Plan

If something goes wrong:

### Backend Rollback
```bash
# List revisions
gcloud run revisions list --service=lani-bot-api --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic lani-bot-api \
  --region=us-central1 \
  --to-revisions=REVISION_NAME=100
```

### Frontend Rollback
1. Go to Cloudflare Pages dashboard
2. Select the deployment
3. Click "Rollback to this deployment"

## Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Monthly: Review costs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review

### Updates
When updating the app:
1. Test locally first
2. Push to GitHub
3. Monitor deployments
4. Verify functionality
5. Check for errors
6. Rollback if needed

---

## Success! 🎉

Your Lani Bot is now live and ready to help cadets study!

**Important Links:**
- Backend: `https://your-backend.run.app`
- Frontend: `https://your-site.pages.dev`
- Monitoring: Cloud Console + Cloudflare Dashboard

Remember to share these links with the Det 175 team!
