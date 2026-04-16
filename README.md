# 🐔 CoopKeeper

CoopKeeper is a full-stack web application for managing backyard chickens, tracking egg production, recording feed usage, and monitoring coop operations.

Built with FastAPI and PostgreSQL, it demonstrates real-world backend architecture, authentication, operational tracking, and deployment-ready design in a clean, unified service.

🌐 **Live App:** https://www.coopkeeper.net  
📚 **API Docs:** https://www.coopkeeper.net/docs  

---

## ⚡ Features

### 🔐 Core System
* Secure user authentication and API access  
* Full-stack architecture (API + frontend served together)  
* Environment-based configuration (local, staging, production)  
* Docker support for database setup  

### 🐔 Flock Management
* Chicken record management  
* Centralized flock tracking  

### 🥚 Production Tracking
* Egg record logging  
* Historical production tracking  

### 🌾 Feed Tracking
* Feed purchase and usage logging  
* Cost tracking over time  

### 💰 Expense Tracking
* Coop-related expense logging  
* Operational cost visibility  

### 🛠️ Coop Management
* Cleaning and maintenance logs  
* Track coop upkeep history  
* Build consistent care routines  

### 🔔 Alerts & Notifications
* Custom alerts for coop tasks  
* Cleaning and maintenance reminders  
* Extensible system for future automated notifications  

### 📊 Dashboard
* Overview of coop activity  
* Designed for future analytics and reporting  

---

## 🛠️ Tech Stack

* **Backend:** FastAPI (Python)  
* **Database:** PostgreSQL  
* **Frontend:** HTML, CSS, JavaScript (served via FastAPI)  
* **Infra:** Docker, Uvicorn  

---

## 🧠 Engineering Highlights

* Clean separation of concerns (routers, models, config)  
* Token-based authentication system  
* Multi-entity CRUD architecture:
  * chickens  
  * eggs  
  * feed  
  * expenses  
  * alerts  
  * maintenance logs  
* Operational tracking system (beyond basic CRUD)  
* Extensible alerting system for scheduled tasks  
* PostgreSQL-backed persistence  
* Environment-driven configuration system  
* Production-ready startup configuration (multi-worker support)  
* Unified backend serving both API and frontend  

---

## 💼 Why This Project Matters

CoopKeeper goes beyond simple CRUD by introducing operational tooling such as maintenance logs and alerting systems, enabling active management of coop health and upkeep.

This project simulates a real-world production system used to manage livestock operations and track operational data.

It demonstrates the ability to design, build, and deploy a complete full-stack application, including:

* API design and routing  
* Authentication and security  
* Persistent data storage  
* Operational feature development  
* Environment configuration  
* Deployment and production readiness  

---

## 🚀 Local Development

### 1. Setup environment

Create a `.env` file from:
