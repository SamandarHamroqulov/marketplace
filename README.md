# Cyber Store

Monorepo: NestJS API (`backend/`) + React Vite storefront (`frontend/`).

## Structure

```
backend/     NestJS API, PostgreSQL, Redis
frontend/    React + Vite SPA
docker-compose.yml
```

## Development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API port is set in `backend/.env` (`PORT`, default 3000). Example: `http://localhost:2000/api`  
Swagger (dev): `http://localhost:<PORT>/api/docs`  
Health: `http://localhost:<PORT>/api/health`

Set `frontend/.env` → `VITE_BACKEND_URL` to the same host/port as backend.

## Auth pages

- **Sign in** — navbar “Sign in” or `/` → login page
- **Register** — customer account (USER), email OTP verification
- **Account** — profile and orders (logged-in users)
- **Admin panel** — navbar “Admin” (ADMIN role only)

### Create an admin user

Register a user, then in PostgreSQL:

```sql
UPDATE users SET role = 'ADMIN', "isVerified" = true WHERE email = 'your@email.com';
```

Then sign in — you will be redirected to the admin panel.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api` and `/uploads` to backend)

### Root scripts

```bash
npm run dev:backend
npm run dev:frontend
npm run build
```

## Production (Docker)

```bash
cp backend/.env.example backend/.env
# Edit JWT_SECRET and mail settings in backend/.env
docker compose up -d --build
```

- Frontend: `http://localhost`
- Backend: `http://localhost:3000/api`

## Product filters

`GET /api/products/all?search=iphone&categoryId=<uuid>&minPrice=100&maxPrice=2000&inStock=true&sort=price_desc&page=1&limit=20`
