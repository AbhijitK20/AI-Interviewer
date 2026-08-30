#!/bin/bash

# AI Interviewer - Initial Setup
# Usage: ./setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAVEN_HOME="/tmp/opencode/maven/apache-maven-3.9.9"

echo "=========================================="
echo "  AI Interviewer - Setup"
echo "=========================================="

# Check Java
echo ""
echo "[1/5] Checking Java..."
if command -v java &> /dev/null; then
    java -version 2>&1 | head -1
else
    echo "Error: Java not found. Please install Java 21+."
    exit 1
fi

# Check/Install Maven via SDKMAN
echo ""
echo "[2/5] Checking Maven..."
if [ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
    source "$HOME/.sdkman/bin/sdkman-init.sh"
fi

if command -v mvn &> /dev/null; then
    mvn --version 2>&1 | head -1
else
    echo "Maven not found. Installing via SDKMAN..."
    if [ ! -f "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
        curl -s "https://get.sdkman.io" | bash
    fi
    source "$HOME/.sdkman/bin/sdkman-init.sh"
    sdk install maven
    echo "Maven installed."
fi

# Check Node
echo ""
echo "[3/5] Checking Node.js..."
if command -v node &> /dev/null; then
    node --version
else
    echo "Error: Node.js not found. Please install Node.js 18+."
    exit 1
fi

# Check Python
echo ""
echo "[4/5] Checking Python..."
if command -v python3 &> /dev/null; then
    python3 --version
else
    echo "Error: Python not found. Please install Python 3.11+."
    exit 1
fi

# Setup AI Service
echo ""
echo "[5/5] Setting up AI Service..."
cd "$SCRIPT_DIR/ai-service"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || . venv/Scripts/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file. Edit it with your API keys."
fi

# Setup Frontend
echo ""
echo "Setting up Frontend..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

# Build Backend
echo ""
echo "Building Backend..."
cd "$SCRIPT_DIR/backend"
mvn compile -q

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Make sure MySQL is running"
echo "2. Run: mysql -u root -p < database/schema.sql"
echo "3. Edit backend/src/main/resources/application.properties with your DB credentials"
echo "4. Edit ai-service/.env with your API keys (optional, uses mock by default)"
echo "5. Run: ./start.sh"
echo ""
