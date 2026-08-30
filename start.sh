#!/bin/bash

# AI Interviewer - Start All Services
# Usage: ./start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  AI Interviewer - Starting Services"
echo "=========================================="

# Source SDKMAN if available
if [ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
    source "$HOME/.sdkman/bin/sdkman-init.sh"
fi

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo "Maven not found. Please run ./setup.sh first."
    exit 1
fi

# Start MySQL check
echo ""
echo "[1/4] Checking MySQL..."
if command -v mysql &> /dev/null; then
    echo "MySQL client found."
else
    echo "Warning: MySQL client not found. Make sure MySQL is running."
fi

# Start AI Service
echo ""
echo "[2/4] Starting AI Service (Port 8001)..."
cd "$SCRIPT_DIR/ai-service"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || . venv/Scripts/activate

if [ ! -f "venv/pyvenv.cfg" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start AI service in background
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8001 > ai-service.log 2>&1 &
AI_PID=$!
echo "AI Service started (PID: $AI_PID)"

# Start Backend
echo ""
echo "[3/4] Starting Spring Boot Backend (Port 8080)..."
cd "$SCRIPT_DIR/backend"

nohup mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start Frontend
echo ""
echo "[4/4] Starting React Frontend (Port 5173)..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "=========================================="
echo "  All services started!"
echo "=========================================="
echo ""
echo "  Frontend:    http://localhost:5173"
echo "  Backend:     http://localhost:8080"
echo "  AI Service:  http://localhost:8001"
echo "  API Docs:    http://localhost:8001/docs"
echo ""
echo "  Default Login:"
echo "    Email: admin@interviewer.com"
echo "    Password: admin123"
echo ""
echo "  Logs:"
echo "    AI Service: $SCRIPT_DIR/ai-service/ai-service.log"
echo "    Backend:    $SCRIPT_DIR/backend/backend.log"
echo "    Frontend:   $SCRIPT_DIR/frontend/frontend.log"
echo ""
echo "  To stop all services: ./stop.sh"
echo "=========================================="

# Save PIDs
echo "$AI_PID" > "$SCRIPT_DIR/.ai-service.pid"
echo "$BACKEND_PID" > "$SCRIPT_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$SCRIPT_DIR/.frontend.pid"
