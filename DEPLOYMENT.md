# Deployment

This project is set up for:

- Frontend: Vercel static Vite deployment.
- Backend: Render Docker web service.
- Local containers: Docker Compose.

## Important Model Note

`backend/models/random_forest.pkl` is about 1.24 GB, so it is intentionally kept out of Git and Docker builds. Cloud deployment uses XGBoost plus Isolation Forest by default with:

```text
IDS_ENABLE_RF=0
```

The smaller required artifacts are allowed in Git:

```text
backend/models/features.pkl
backend/models/isolation.pkl
backend/models/label_encoder.pkl
backend/models/scaler.pkl
backend/models/xgboost.pkl
```

Commit those files before deploying, otherwise `/predict` cannot load the model bundle.

## Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from the repo and select `render.yaml`.
3. Render will build the Docker service from `backend/Dockerfile`.
4. After the first deploy, open:

```text
https://YOUR-RENDER-SERVICE.onrender.com/health
```

5. Copy the Render backend URL. You need it for Vercel.

Recommended Render environment variables:

```text
IDS_ENABLE_RF=0
IDS_CORS_ORIGINS=https://YOUR-VERCEL-APP.vercel.app
```

During first deploy, you can leave `IDS_CORS_ORIGINS` as localhost, then update it after Vercel gives you the real frontend URL.

## Frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. If Vercel asks for the root directory, choose this project folder:

```text
Explainable-AI-IDS
```

3. Vercel will use `vercel.json`:

```text
Build Command: npm run build
Output Directory: dist
Framework: Vite
```

4. Add this environment variable in Vercel:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

5. Redeploy Vercel after setting the environment variable.

6. Go back to Render and set:

```text
IDS_CORS_ORIGINS=https://YOUR-VERCEL-APP.vercel.app
```

Then redeploy the Render backend.

## Docker Locally

From the project root:

```bash
docker compose up --build
```

Local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
Health:   http://localhost:8000/health
```

The Docker image excludes `random_forest.pkl` by default. If you want full Random Forest support in a larger local image, remove the `models/random_forest.pkl` line from `backend/.dockerignore` and set:

```text
IDS_ENABLE_RF=1
```
