#!/bin/bash

# AI Interviewer - Stop All Services
# Usage: ./stop.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping AI Interviewer services..."

# Stop AI Service
if [ -f "$SCRIPT_DIR/.ai-service.pid" ]; then
    AI_PID=$(cat "$SCRIPT_DIR/.ai-service.pid")
    if kill -0 $AI_PID 2>/dev/null; then
        kill $AI_PID
        echo "AI Service stopped (PID: $AI_PID)"
    fi
    rm -f "$SCRIPT_DIR/.ai-service.pid"
fi

# Stop Backend
if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "Backend stopped (PID: $BACKEND_PID)"
    fi
    rm -f "$SCRIPT_DIR/.backend.pid"
fi

# Stop Frontend
if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$SCRIPT_DIR/.frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "Frontend stopped (PID: $FRONTEND_PID)"
    fi
    rm -f "$SCRIPT_DIR/.frontend.pid"
fi

# Kill any remaining processes on ports
echo "Cleaning up ports..."
fuser -k 8001/tcp 2>/dev/null || true
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

echo "All services stopped."
