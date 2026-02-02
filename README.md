# Spam / Ham Checker (Next.js + Tailwind)

Single-page UI that calls your Railway Naive Bayes API (`POST /predict`) and shows SPAM/HAM + probabilities.
It uses a Next.js proxy route (`/api/predict`) to avoid CORS issues.

## Local run
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Configure API URL
Set environment variable (recommended for Railway):
- `SPAM_API_URL=https://web-production-2c982.up.railway.app`

## Deploy to Railway
1. Push this repo to GitHub
2. Railway → New Project → Deploy from GitHub
3. Add Variable:
   - `SPAM_API_URL=https://web-production-2c982.up.railway.app`
4. Deploy
