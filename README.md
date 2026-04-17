# 🐔 CoopKeeper

![Status](https://img.shields.io/badge/status-live-success)
![Backend](https://img.shields.io/badge/backend-FastAPI-green)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![Frontend](https://img.shields.io/badge/frontend-JavaScript-yellow)
![Hosting](https://img.shields.io/badge/hosting-Render-purple)

CoopKeeper is a full-stack portfolio application for managing backyard chickens, tracking egg production, and analyzing real-world costs.

👉 Live App: https://www.coopkeeper.net  
👉 API Docs (dev only): https://www.coopkeeper.net/docs  

---

## Stack

- Backend: FastAPI + PostgreSQL  
- Frontend: HTML, CSS, JavaScript (planned React upgrade)  
- Hosting target: Render  
- DevOps: Docker + GitHub  

---

## Features

- 🐔 Chicken management (simplified data model)  
- 🥚 Egg production tracking with filtering  
- 💰 Centralized expense tracking (single source of truth)  
- 📊 Dashboard with cost-per-dozen insights  
- 🧹 Cleaning logs (decoupled from expenses)  

---

## Screenshots

> Add images to `/screenshots`

- screenshots/dashboard.png  
- screenshots/chickens.png  
- screenshots/eggs.png  
- screenshots/expenses.png  
- screenshots/cleaning.png  

---

## Local Development

1. Copy environment file:

```bash
cp backend/.env.example backend/.env
```

2. Start PostgreSQL with Docker:

```bash
docker compose up -d
```

3. Install backend dependencies:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

4. Run the backend:

```bash
uvicorn app.main:app --reload
```

5. Open the app:

- Frontend: http://127.0.0.1:8000/app  
- API docs: http://127.0.0.1:8000/docs  

---

## Deployment Shape

For production, deploy the frontend and backend as separate Render services:

- https://www.coopkeeper.net/ serves the frontend static site  
- https://api.coopkeeper.net/ serves the FastAPI backend  

This keeps the public portfolio URL clean while maintaining a dedicated API.

---

## Render Setup

The repo includes a root `render.yaml` blueprint with two services:

- coopkeeper-web
  - Render Static Site  
  - Publishes ./frontend  
  - Custom domain: www.coopkeeper.net  

- coopkeeper-api
  - Render Python Web Service  
  - Root directory: backend  
  - Start command: python start.py  
  - Health check: /health  
  - Custom domain: api.coopkeeper.net  

---

## Backend Environment Variables

Set these on the Render API service:

- ENV=prod  
- APP_ENV=production  
- DATABASE_URL=...  
- SECRET_KEY=...  
- CORS_ORIGINS=https://coopkeeper.net,https://www.coopkeeper.net  

---

## Docs Behavior

FastAPI docs are environment-based:

- ENV=dev or unset:
  - /docs  
  - /redoc  
  - /openapi.json  

- ENV=prod:
  - docs disabled  

---

## Frontend API Configuration

The frontend uses `frontend/config.js` to choose the API base URL:

- Localhost: http://127.0.0.1:8000  
- Non-local hosts: https://api.coopkeeper.net  

That means the deployed static site automatically talks to the API subdomain without changing application code.

---

## Custom Domain Notes

On Render, custom domains can be attached to both web services and static sites.

Recommended setup:

- Attach www.coopkeeper.net to the static site  
- Attach api.coopkeeper.net to the FastAPI service  
- Let Render redirect coopkeeper.net to www.coopkeeper.net  

---

## Verification Checklist

After deployment:

- https://www.coopkeeper.net/ loads the frontend UI  
- https://api.coopkeeper.net/ returns {"message":"CoopKeeper API is running"}  
- https://api.coopkeeper.net/health returns success  
- https://api.coopkeeper.net/docs returns 404 in production  
- Login, signup, and all CRUD flows work from the frontend  

---

## Author

**Taylor Burris**  
DevOps / Full Stack Engineer  

---

## ⭐ Support

If you find this project useful or interesting, consider giving it a ⭐ on GitHub — it helps a lot!

---

## License

MIT
