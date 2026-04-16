# 🐔 CoopKeeper

CoopKeeper is a full-stack web application for managing backyard chickens, tracking flock data, and monitoring coop operations.

Built with FastAPI and PostgreSQL, it demonstrates real-world backend architecture, authentication, and deployment-ready design in a clean, single-service setup.

---

## ⚡ Features

* 🔐 User authentication and secure API access
* 🐔 Chicken record management
* 📊 Simple dashboard for tracking flock data
* 🌐 Full-stack architecture (API + frontend served together)
* ⚙️ Environment-based configuration (local, staging, production)
* 🐳 Docker support for database setup

---

## 🛠️ Tech Stack

* **Backend:** FastAPI (Python)
* **Database:** PostgreSQL
* **Frontend:** HTML, CSS, JavaScript (served via FastAPI)
* **Infra:** Docker, Uvicorn

---

## 🧠 Engineering Highlights

* Clean separation of concerns (routers, models, config)
* Environment-driven configuration system
* Token-based authentication
* Database integration using PostgreSQL
* Production-ready startup configuration (multi-worker support)
* API + frontend served from a unified backend for simplified deployment

---

## 💼 Why This Project Matters

This project simulates a real-world production system used to manage livestock operations and track operational data.

It demonstrates the ability to design, build, and deploy a complete full-stack application, including:

* API design and routing
* Authentication and security
* Persistent data storage
* Environment configuration
* Deployment considerations

---

## 🚀 Local Development

### 1. Setup environment

Create a `.env` file from:

```
backend/.env.example
```

---

### 2. Start PostgreSQL with Docker

```bash
docker compose up -d
```

---

### 3. Install backend dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

---

### 4. Run the app

```bash
uvicorn app.main:app --reload
```

---

### 🔗 Access the app

* App: http://localhost:8000/app
* API Docs: http://localhost:8000/docs

---

## ⚙️ Environment Variables

### Required

* `DATABASE_URL`
* `SECRET_KEY` (required outside local development)

### Common

* `APP_ENV=local|staging|production`
* `APP_TITLE`
* `APP_VERSION`
* `ACCESS_TOKEN_EXPIRE_MINUTES`
* `FRONTEND_API_BASE_URL`
* `CORS_ORIGINS`
* `HOST`
* `PORT`
* `WEB_CONCURRENCY`

### Notes

* Leave `FRONTEND_API_BASE_URL` empty when frontend is served by the same backend
* Set `CORS_ORIGINS` only when using different domains

---

## 🧪 Staging

* Use a staging Postgres database
* Set `APP_ENV=staging`
* Use a real `SECRET_KEY`
* Configure `CORS_ORIGINS` if needed

Run:

```bash
cd backend
python start.py
```

---

## 🌍 Production

### Recommended Setup

* PostgreSQL hosted separately
* FastAPI behind a reverse proxy (NGINX, platform router, etc.)
* TLS handled at the proxy/platform

### Example Environment

```env
APP_ENV=production
DATABASE_URL=postgresql+psycopg://...
SECRET_KEY=strong-random-secret
PORT=8000
WEB_CONCURRENCY=2
CORS_ORIGINS=https://your-frontend-domain.com
FRONTEND_API_BASE_URL=
```

---

### Run in production

```bash
cd backend
python start.py
```

---

## ✅ Deployment Checklist

* [ ] Set `SECRET_KEY`
* [ ] Configure `DATABASE_URL`
* [ ] Set `APP_ENV=production`
* [ ] Configure `CORS_ORIGINS` if needed
* [ ] Verify `/health`
* [ ] Verify `/health/db`
* [ ] Confirm `/app` loads successfully

---

## 📌 Future Improvements

* Dashboard analytics (egg production, trends)
* Role-based access (admin vs user)
* Mobile-friendly UI improvements
* API pagination and filtering
* Deployment to cloud platform (AWS / Render / Fly.io)

---

## 📷 Screenshots

*Add screenshots of dashboard, login, and chicken management views here*

---

## 📄 License

MIT (or update if different)
