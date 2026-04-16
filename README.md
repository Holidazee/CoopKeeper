# CoopKeeper Deployment Notes

CoopKeeper is a single FastAPI app that serves both the API and the MVP frontend.
That makes deployment straightforward: one backend process, one database, and one
set of environment variables.

## Environment variables

Start from `backend/.env.example`.

Required:

- `DATABASE_URL`
- `SECRET_KEY` outside local development

Common:

- `APP_ENV=local|staging|production`
- `APP_TITLE`
- `APP_VERSION`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `FRONTEND_API_BASE_URL`
- `CORS_ORIGINS`
- `HOST`
- `PORT`
- `WEB_CONCURRENCY`

Notes:

- Leave `FRONTEND_API_BASE_URL` empty when the frontend is served by the same backend domain.
- Set `FRONTEND_API_BASE_URL` only if the frontend will call the API on a different base URL.
- Set `CORS_ORIGINS` to a comma-separated list only when browsers will call the API from another origin.

## Local development

1. Create a backend env file from `backend/.env.example`.
2. Start Postgres with Docker:

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

4. Run the API with reload:

```bash
uvicorn app.main:app --reload
```

Open:

- App: `http://localhost:8000/app`
- Docs: `http://localhost:8000/docs`

## Staging

Use staging as close to production as possible:

- point `DATABASE_URL` to a staging Postgres database
- set `APP_ENV=staging`
- set a real `SECRET_KEY`
- set `CORS_ORIGINS` to the staging frontend domain if the frontend is hosted separately
- keep `FRONTEND_API_BASE_URL` empty if FastAPI serves the frontend on the same domain

Run the backend with the production startup command:

```bash
cd backend
python start.py
```

## Production

Recommended simple shape:

- run Postgres separately
- run FastAPI behind a reverse proxy or platform router
- terminate TLS at the proxy/platform
- point your real domain to the backend service

Suggested production env:

```env
APP_ENV=production
DATABASE_URL=postgresql+psycopg://...
SECRET_KEY=strong-random-secret
PORT=8000
WEB_CONCURRENCY=2
CORS_ORIGINS=https://your-frontend-domain.com
FRONTEND_API_BASE_URL=
```

Production backend startup command:

```bash
cd backend
python start.py
```

The startup script runs:

- `app.main:app`
- `host=0.0.0.0`
- `port=$PORT`
- `workers=$WEB_CONCURRENCY`
- proxy header support for real deployments

## Deployment checklist

- set `SECRET_KEY`
- set the real `DATABASE_URL`
- set `APP_ENV=production`
- set `CORS_ORIGINS` if the frontend and API are on different origins
- keep `FRONTEND_API_BASE_URL` empty for same-origin deployments
- verify `/health` and `/health/db`
- verify `/app` loads after deployment
