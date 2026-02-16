# Freelancer SaaS Tool

A professional SaaS application for freelancers to manage projects, invoices, and cashflow.

## 🏗️ Architecture

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 15 + TypeScript + TailwindCSS + React Query
- **Database**: PostgreSQL (via Docker)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### One-Command Setup (Recommended)

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

This will automatically:
- ✅ Install all dependencies (Backend + Frontend)
- ✅ Start PostgreSQL database
- ✅ Run database migrations
- ✅ Seed demo data

**Demo Account:** `demo@freelancer.com` / `demo123`

---

### Start Development Servers

**Option A: Automated (Opens 2 Terminal Windows)**

Linux/Mac: `./start-dev.sh`
Windows: `start-dev.bat`

**Option B: Manual (2 Separate Terminals)**

Terminal 1 - Backend:
```bash
cd backend && npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend && npm run dev
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:3001/api

---

### Manual Setup (If Needed)

<details>
<summary>Click to expand manual setup steps</summary>

1. **Clone & Environment Variables**
```bash
git clone <your-repo-url>
cd freelancer-tool
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

2. **Start Database**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

3. **Backend Setup**
```bash
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

4. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
</details>

### Production Deployment with Docker

**Option 1: Full Stack with Docker Compose**
```bash
# Build and start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Option 2: Separate Deployment**
```bash
# Build Backend
cd backend
docker build -t freelancer-backend .

# Build Frontend
cd frontend
docker build -t freelancer-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api-url.com/api .

# Run with environment variables
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  freelancer-backend
```

## 📊 Features

### MVP (Current)
- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ Customer Management (CRUD)
- ✅ Invoice Management with Auto-Status Calculation
- ✅ Payment Tracking with Invoice Integration
- ✅ Dashboard with Financial KPIs
- ✅ Cashflow Forecast (90 days)
- ✅ Row-Level Security

### Status Flow
```
Invoice: DRAFT → SENT → PARTIALLY_PAID → PAID
                      ↓
                   OVERDUE (auto-detected daily)
```

## 🔐 Security

- JWT with 15min access tokens + 7-day refresh tokens
- Row-Level Security (all data filtered by ownerId)
- Password hashing with bcrypt
- Input validation with class-validator

## 📁 Project Structure

```
freelancer-tool/
├── backend/               # NestJS Backend
│   ├── src/
│   │   ├── core/         # Infrastructure (DB, Guards)
│   │   ├── modules/      # Feature Modules
│   │   └── main.ts
│   └── prisma/           # Database Schema
├── frontend/             # Next.js Frontend
│   ├── app/             # App Router Pages
│   ├── components/      # React Components
│   └── lib/             # API Client, Hooks, Stores
└── docker-compose.yml   # PostgreSQL Container
```

## 🛠️ Tech Stack

**Backend:**
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL
- Passport.js + JWT
- @nestjs/schedule (Cron Jobs)

**Frontend:**
- Next.js 15 (App Router)
- TanStack Query (React Query)
- Zustand (State Management)
- Axios (API Client)
- TailwindCSS

## 📝 API Endpoints

**Auth:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- GET `/api/auth/me`

**Customers:**
- GET/POST/PATCH/DELETE `/api/customers`

**Invoices:**
- GET/POST/PATCH/DELETE `/api/invoices`
- POST `/api/invoices/:id/send`
- GET `/api/invoices/overdue`

**Payments:**
- GET/POST/PATCH/DELETE `/api/payments`
- GET `/api/payments/stats`

**Dashboard:**
- GET `/api/dashboard/stats`
- GET `/api/dashboard/cashflow`
- GET `/api/dashboard/overdue`
- GET `/api/dashboard/activity`
- GET `/api/dashboard/revenue-trend`

## 🚢 Deployment

### Docker Deployment (Recommended for Self-Hosting)

The application includes production-ready Dockerfiles with multi-stage builds:

- **Backend**: Optimized NestJS image with automatic Prisma migrations
- **Frontend**: Next.js standalone build for minimal image size
- **docker-compose.yml**: Complete stack setup with networking

### Cloud Deployment Options

**Option A: Platform-as-a-Service**
- Backend: Railway, Render, or Fly.io
- Frontend: Vercel or Netlify
- Database: Neon, Supabase, or Railway Postgres

**Option B: Container Orchestration**
- Docker Compose on VPS (DigitalOcean, Hetzner)
- Kubernetes (for larger scale)
- AWS ECS / Google Cloud Run

### Environment Variables for Production

See `.env.example` for all required variables. Key settings:
- Generate strong JWT secrets (32+ characters)
- Use production-grade PostgreSQL
- Set `NODE_ENV=production`
- Configure `NEXT_PUBLIC_API_URL` to your API domain

## 📄 License

MIT

---

Built with 💙 by Claude & Human
