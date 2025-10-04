# Lani Bot - Detachment 175 Study Assistant Chatbot 🎓

A production-ready, stateless web application that provides an AI-powered chatbot for Detachment 175 cadets to study Warrior Knowledge and General Cadet Knowledge. Built with Flask + Groq (gpt-oss-120b) backend and React + TypeScript frontend, featuring the Detachment 175 color palette.

## 🌟 Features

- **Stateless Architecture**: No database, no persistent sessions
- **AI-Powered Questions**: Uses Groq's `openai/gpt-oss-120b` model
- **Static Questions**: Pre-defined questions from LLAB content
- **LLAB Focused**: Select specific LLABs to study
- **Streaming Responses**: Real-time token streaming for fluid UX
- **Detachment 175 Themed**: Academy Blue, Dark Blue, Silver color palette
- **Dark/Light Mode**: Responsive UI with theme toggle
- **Rate Limited**: 20 requests per 5 minutes per IP
- **DDOS Protection**: Cloudflare Turnstile integration
- **Production Ready**: Docker + Cloud Run + Cloudflare Pages

## 🏗️ Architecture

```
Frontend (Cloudflare Pages)
    ↓ HTTPS
Backend (Google Cloud Run)
    ↓ HTTPS
Groq API (openai/gpt-oss-120b)
```

### Tech Stack

**Frontend:**
- Vite + React 18
- TypeScript
- CSS Variables (Detachment 175 colors)
- Cloudflare Turnstile
- Fetch API (streaming)

**Backend:**
- Python 3.12
- Flask + Gunicorn
- Groq API (OpenAI-compatible)
- Rate limiting (in-memory)
- CORS (strict allowlist)

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker & Docker Compose
- Groq API key ([groq.com](https://groq.com))
- Cloudflare account (for Turnstile)
- Google Cloud account (for deployment)

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/Det175_Chatbot.git
cd Det175_Chatbot
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

3. **Start backend with Docker:**
```bash
docker-compose up -d
```

4. **Start frontend dev server:**
```bash
cd frontend
npm install
npm run dev
```

5. **Open browser:**
```
http://localhost:5173
```

### Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=gsk_your_api_key_here
TURNSTILE_SECRET=your_turnstile_secret
```

For development, you can use `test-secret` for Turnstile.

## 📦 Deployment

### Backend (Google Cloud Run)

1. **Enable required services:**
```bash
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

2. **Create secrets:**
```bash
echo -n "your_groq_key" | gcloud secrets create GROQ_API_KEY --data-file=-
echo -n "your_turnstile_secret" | gcloud secrets create TURNSTILE_SECRET --data-file=-
```

3. **Build and deploy:**
```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/lani-bot-api
gcloud run deploy lani-bot-api \
  --image gcr.io/YOUR_PROJECT_ID/lani-bot-api \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --cpu 1 --memory 512Mi \
  --set-env-vars "ALLOWED_ORIGINS=https://yourdomain.com" \
  --set-secrets "GROQ_API_KEY=GROQ_API_KEY:latest,TURNSTILE_SECRET=TURNSTILE_SECRET:latest"
```

### Frontend (Cloudflare Pages)

1. **Connect GitHub repo** to Cloudflare Pages
2. **Build settings:**
   - Build command: `cd frontend && npm ci && npm run build`
   - Build output directory: `frontend/dist`
   - Root directory: `/`
3. **Environment variables:**
   - `VITE_API_URL`: Your Cloud Run URL
4. **Deploy** on push to `main`

### CI/CD Setup

**Backend (GitHub Actions):**
- Configure Workload Identity Federation
- Add secrets: `GCP_PROJECT_ID`, `WIF_PROVIDER`, `WIF_SERVICE_ACCOUNT`, `ALLOWED_ORIGINS`
- Push to `main` triggers deployment

**Frontend:**
- Automatic via Cloudflare Pages GitHub integration

## 🧪 Testing

### Backend Unit Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### Load Testing (k6)

```bash
cd tests
k6 run load-test.js
```

## 🔒 Security Features

- **Rate Limiting**: 20 requests per 5 min per IP
- **Turnstile Verification**: CAPTCHA on all chat requests
- **CORS**: Strict origin allowlist
- **Input Validation**: Size limits, type checking
- **Secret Management**: Google Secret Manager
- **No Data Persistence**: Stateless design
- **Timeouts**: 60s request timeout
- **Non-root Container**: Security best practices

## 🎨 Detachment 175 Color Theme

```css
--blue-1: #003594  /* Academy Blue */
--blue-2: #002554  /* Dark Blue */
--silver: #B2B4B2  /* Silver */
--white: #FFFFFF   /* White */
```

## 📊 Project Structure

```
Det175_Chatbot/
├── backend/
│   ├── app.py              # Flask app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   └── LLABSelector.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   └── theme.css
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── Data/
│   ├── LLAB Data/
│   │   └── LLAB1.txt - LLAB12.txt
│   └── Static Questions/
│       ├── aircraftQuestions.json
│       └── rankQuestions.json
├── .github/
│   └── workflows/
│       └── deploy-backend.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Configuration

### Backend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key (required) | - |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173` |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `20` |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds) | `300` |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret | `test-secret` |
| `PORT` | Server port | `8080` |

### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |

## 📝 API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{"ok": true, "service": "lani-bot-api"}
```

### `POST /chat`
Stream chat responses from Groq API.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "What is the F-15's role?"}
  ],
  "llab_numbers": [2, 3],
  "quiz_mode": "mixed",
  "turnstile_token": "..."
}
```

**Response:**
SSE stream with JSON chunks:
```
data: {"choices":[{"delta":{"content":"The"}}]}
data: {"choices":[{"delta":{"content":" F-15"}}]}
data: [DONE]
```

### `POST /static-question`
Get a random static question.

**Request:**
```json
{
  "llab_numbers": [2, 4]
}
```

**Response:**
```json
{
  "question": {
    "id": "aircraft_llab2_1",
    "type": "multiple_choice",
    "question": "What is the primary role of the F-15 Eagle?",
    "options": ["..."],
    "correctAnswer": "Air superiority fighter"
  }
}
```

## 🐛 Troubleshooting

### Backend won't start
- Check `GROQ_API_KEY` is set correctly
- Verify Docker is running
- Check port 8080 isn't in use

### Frontend can't connect to backend
- Verify `VITE_API_URL` points to backend
- Check CORS `ALLOWED_ORIGINS` includes frontend URL
- Ensure backend is healthy: `curl http://localhost:8080/health`

### Turnstile verification fails
- Use `test-secret` for local development
- Verify Turnstile widget is loaded
- Check `TURNSTILE_SECRET` matches your site

### Rate limit errors
- Wait 5 minutes before retrying
- Adjust `RATE_LIMIT_REQUESTS` if needed
- Check if multiple users share same IP

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Detachment 175 Detachment 175
- Groq for AI inference
- Cloudflare for hosting and security
- Google Cloud for serverless infrastructure

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Contact Det 175 IT team

---

**Built with ❤️ for Detachment 175 Cadets**
