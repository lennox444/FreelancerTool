#!/bin/bash

# Freelancer Tool - Development Start Script
# Starts both Backend and Frontend in parallel

set -e

echo "🚀 Starting Freelancer Tool..."
echo ""

# Check if database is running
if ! docker ps | grep -q freelancer-postgres-dev; then
    echo "🐳 Starting PostgreSQL..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "⏳ Waiting for database..."
    sleep 3
fi

echo "🔧 Starting Backend and Frontend..."
echo ""

# Start backend and frontend in parallel using background processes
cd backend && npm run start:dev &
BACKEND_PID=$!

cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services starting..."
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
