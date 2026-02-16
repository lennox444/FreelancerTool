#!/bin/bash

# Freelancer Tool - Quick Setup Script (Linux/Mac)
# This script will set up the entire application

set -e  # Exit on error

echo "🚀 Freelancer Tool - Quick Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo ""
echo "📦 Step 1: Installing Backend Dependencies..."
cd backend
npm install

echo ""
echo "📦 Step 2: Installing Frontend Dependencies..."
cd ../frontend
npm install

echo ""
echo "🐳 Step 3: Starting PostgreSQL Database..."
cd ..
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for database to be ready..."
sleep 5

echo ""
echo "🗄️  Step 4: Running Database Migrations..."
cd backend
npx prisma migrate dev --name init

echo ""
echo "🌱 Step 5: Seeding Demo Data..."
npm run prisma:seed

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🎉 You can now start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run start:dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "📊 Demo Account:"
echo "  Email:    demo@freelancer.com"
echo "  Password: demo123"
echo ""
echo "🌐 Access the app at: http://localhost:3000"
echo "🔧 API Docs at: http://localhost:3001/api"
