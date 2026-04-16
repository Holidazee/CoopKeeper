# 🐔 CoopKeeper

CoopKeeper is a full-stack web application for managing backyard chickens, tracking flock data, and monitoring coop operations.

Built with FastAPI and PostgreSQL, it demonstrates real-world backend architecture, authentication, and deployment-ready design in a clean, single-service setup.

---

## ⚡ Features

- 🔐 User authentication and secure API access  
- 🐔 Chicken record management  
- 📊 Simple dashboard for tracking flock data  
- 🌐 Full-stack architecture (API + frontend served together)  
- ⚙️ Environment-based configuration (local, staging, production)  
- 🐳 Docker support for database setup  

---

## 🛠️ Tech Stack

- **Backend:** FastAPI (Python)  
- **Database:** PostgreSQL  
- **Frontend:** HTML, CSS, JavaScript (served via FastAPI)  
- **Infra:** Docker, Uvicorn  

---

## 🧠 Engineering Highlights

- Clean separation of concerns (routers, models, config)
- Environment-driven configuration system
- Token-based authentication
- Database integration using PostgreSQL
- Production-ready startup configuration (multi-worker support)
- API + frontend served from a unified backend for simplified deployment

---

## 💼 Why This Project Matters

This project simulates a real-world production system used to manage livestock operations and track operational data.

It demonstrates the ability to design, build, and deploy a complete full-stack application, including:

- API design and routing  
- Authentication and security  
- Persistent data storage  
- Environment configuration  
- Deployment considerations  

---

## 🚀 Local Development

### 1. Setup environment

Create a `.env` file from:
