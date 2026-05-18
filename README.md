# CyberStore Marketplace

Fullstack marketplace project built with:

* Backend: NestJS + TypeORM + PostgreSQL + Redis
* Frontend: React + Vite
* Docker & Docker Compose support
* JWT Authentication
* Swagger API Documentation
* Redis Cache

---

# Tech Stack

## Backend

* NestJS
* TypeORM
* PostgreSQL
* Redis
* JWT Auth
* Swagger
* Docker

## Frontend

* React
* Vite
* Docker

---

# Project Structure

```bash
exam-8/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd exam-8
```

---

# Environment Variables

## Backend `.env`

Create file:

```bash
backend/.env
```

Example:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=cyberstore

JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_password
MAIL_FROM=CyberStore <your_email@gmail.com>
```

---

## Frontend `.env`

Create file:

```bash
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:3000/api
```

---

# Running Without Docker

## Backend

```bash
cd backend
npm install
npm run start:dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Running With Docker

## Start All Services

```bash
docker compose up --build
```

## Run In Background

```bash
docker compose up -d --build
```

## Stop Containers

```bash
docker compose down
```

---

# Docker Services

| Service    | Port |
| ---------- | ---- |
| Frontend   | 5173 |
| Backend    | 3000 |
| PostgreSQL | 5432 |
| Redis      | 6379 |

---

# Swagger Documentation

Swagger URL:

```bash
http://localhost:3000/api/docs
```

---

# Useful Commands

## Backend

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run test
```

## Frontend

```bash
npm run dev
npm run build
npm run preview
```

---

# Common Docker Fix

If you get this error:

```bash
npm ci can only install packages when your package.json and package-lock.json are in sync
```

Run:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Then rebuild:

```bash
docker compose up --build
```

---

# Features

* Authentication & Authorization
* JWT Security
* Redis Cache
* PostgreSQL Database
* REST API
* Swagger Docs
* Dockerized Infrastructure
* Fullstack Architecture

---

# Author

Samandar

Instagram: @1.hamroqulov and @xamroqulovdev
Telegram: @xamroqulovdev
Linkedin: https://www.linkedin.com/in/samandar-hamroqulov-723202344/
