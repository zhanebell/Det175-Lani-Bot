# 🚀 Quick Start Guide

Get Lani Bot running locally in 5 minutes!

## Prerequisites Checklist

- [ ] Python 3.12+ installed
- [ ] Node.js 18+ installed
- [ ] Docker Desktop installed and running
- [ ] Groq API key ([Get one here](https://console.groq.com/keys))
- [ ] Git installed

## Step-by-Step Setup

### 1. Clone Repository
```powershell
git clone https://github.com/yourusername/Det175_Chatbot.git
cd Det175_Chatbot
```

### 2. Configure Environment
```powershell
# Copy example environment file
Copy-Item .env.example .env

# Edit .env and add your Groq API key
notepad .env
```

Add this line with your actual key:
```
GROQ_API_KEY=gsk_your_actual_key_here
TURNSTILE_SECRET=test-secret
```

### 3. Start Backend
```powershell
docker-compose up -d
```

Wait about 30 seconds for the backend to start, then test:
```powershell
curl http://localhost:8080/health
```

Expected response: `{"ok":true,"service":"lani-bot-api"}`

### 4. Start Frontend
```powershell
cd frontend
npm install
npm run dev
```

### 5. Open Browser
Navigate to: **http://localhost:5173**

You should see the Lani Bot interface!

## Testing the Bot

1. **Select LLABs**: Choose one or more LLABs (try LLAB 2 and 3)
2. **Choose Mode**: Select "Mixed" for both static and AI questions
3. **Start Session**: Click "Start Study Session 🚀"
4. **Chat**: Type "ready" to get your first question!

## Troubleshooting

### Backend won't start
```powershell
# Check Docker is running
docker ps

# View backend logs
docker-compose logs -f

# Restart backend
docker-compose restart
```

### Frontend errors
```powershell
# Clear node_modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Can't connect to backend
1. Verify backend is running: `docker ps`
2. Check health endpoint: `curl http://localhost:8080/health`
3. Check frontend `.env` has correct API URL

### Port already in use
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## Next Steps

- [ ] Read the full [README.md](README.md)
- [ ] Review [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) for production deployment
- [ ] Set up Cloudflare Turnstile for production
- [ ] Deploy backend to Google Cloud Run
- [ ] Deploy frontend to Cloudflare Pages

## Common Commands

```powershell
# Stop everything
docker-compose down

# View backend logs
docker-compose logs -f backend

# Rebuild backend after code changes
docker-compose up -d --build

# Run backend tests
cd backend
python -m pytest tests/

# Build frontend for production
cd frontend
npm run build
```

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review error messages in browser console (F12)
- Check backend logs: `docker-compose logs -f`
- Verify your Groq API key is valid

## Production Deployment

Once everything works locally, follow these guides:

1. **Backend**: See GitHub Actions workflow in `.github/workflows/deploy-backend.yml`
2. **Frontend**: See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)

---

**Need help?** Check the logs, read the error messages, and ensure all prerequisites are met!
