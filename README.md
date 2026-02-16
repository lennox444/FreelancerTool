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

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd freelancer-tool
```

2. **Start Database**
```bash
docker-compose up -d
```

3. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```
Backend runs on: `http://localhost:3001/api`

4. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Frontend runs on: `http://localhost:3000`

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

**Recommended:**
- Backend: Railway or Render
- Frontend: Vercel
- Database: Neon (Serverless Postgres)

## 📄 License

MIT

---

Built with 💙 by Claude & Human
