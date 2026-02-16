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

### Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd freelancer-tool
```

2. **Environment Variables**
```bash
# Copy .env.example to backend/.env
cp .env.example backend/.env
# Edit backend/.env and set your JWT secrets

# Copy .env.example to frontend/.env.local
cp .env.example frontend/.env.local
```

3. **Start Database (Development)**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

4. **Backend Setup**
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```
Backend runs on: `http://localhost:3001/api`

5. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

6. **Seed Demo Data (Optional)**
```bash
cd backend
npm run prisma:seed
```
Demo Account: `demo@freelancer.com` / `demo123`

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
