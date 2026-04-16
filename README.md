# CoopKeeper

CoopKeeper is a portfolio full-stack app for tracking chickens, egg production, feed usage, expenses, cleaning logs, and alerts.

## Stack

- Backend: FastAPI + PostgreSQL
- Frontend: HTML, CSS, and JavaScript
- Hosting target: Render

## Local Development

1. Copy `backend/.env.example` to `backend/.env`.
2. Start PostgreSQL with Docker:

```bash
docker compose up -d
```

3. Install backend dependencies:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Run the backend:

```bash
uvicorn app.main:app --reload
```

5. Open the app:

- Frontend: [http://127.0.0.1:8000/app](http://127.0.0.1:8000/app)
- API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Deployment Shape

For production, deploy the frontend and backend as separate Render services:

- `https://www.coopkeeper.net/` serves the frontend static site
- `https://api.coopkeeper.net/` serves the FastAPI backend

This keeps the public portfolio URL clean while preserving a dedicated API origin.

## Render Setup

The repo includes a root `render.yaml` blueprint with two services:

- `coopkeeper-web`
  - Render Static Site
  - Publishes `./frontend`
  - Custom domain: `www.coopkeeper.net`
- `coopkeeper-api`
  - Render Python Web Service
  - Root directory: `backend`
  - Start command: `python start.py`
  - Health check: `/health`
  - Custom domain: `api.coopkeeper.net`

### Backend environment variables

Set these on the Render API service:

- `ENV=prod`
- `APP_ENV=production`
- `DATABASE_URL=...`
- `SECRET_KEY=...`
- `CORS_ORIGINS=https://coopkeeper.net,https://www.coopkeeper.net`

### Docs behavior

FastAPI docs are environment-based:

- `ENV=dev` or unset:
  - `/docs`
  - `/redoc`
  - `/openapi.json`
- `ENV=prod`:
  - docs disabled

## Frontend API Configuration

The frontend uses `frontend/config.js` to choose the API base URL:

- Localhost: `http://127.0.0.1:8000`
- Non-local hosts: `https://api.coopkeeper.net`

That means the deployed static site automatically talks to the API subdomain without changing application code.

## Custom Domain Notes

On Render, custom domains can be attached to both web services and static sites. When you add a `www` subdomain, Render automatically adds the matching root domain and redirects it to `www`.

Recommended setup:

- Attach `www.coopkeeper.net` to the static site
- Attach `api.coopkeeper.net` to the FastAPI service
- Let Render redirect `coopkeeper.net` to `www.coopkeeper.net`

## Verification Checklist

After deployment:

- `https://www.coopkeeper.net/` loads the frontend UI
- `https://api.coopkeeper.net/` returns `{"message":"CoopKeeper API is running"}`
- `https://api.coopkeeper.net/health` returns success
- `https://api.coopkeeper.net/docs` returns `404` in production
- Login, signup, and all CRUD flows still work from the frontend
