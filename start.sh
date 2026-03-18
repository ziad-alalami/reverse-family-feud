#!/bin/bash

# EID Game Quick Start Script
# This script sets up and starts both backend and frontend

set -e

echo "==============================================="
echo "EID Game - Quick Start"
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required tools
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites satisfied${NC}"

# Navigate to backend and install/run
echo -e "\n${BLUE}Setting up backend...${NC}"
cd backend

if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}Installing uv...${NC}"
    pip install uv
fi

echo "Installing backend dependencies..."
uv sync

echo -e "${GREEN}✓ Backend setup complete${NC}"

# Start backend in background
echo "Starting backend server..."
uv run python run.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

cd ..

# Navigate to frontend and install/run
echo -e "\n${BLUE}Setting up frontend...${NC}"
cd frontend

echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"

# Start frontend
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

cd ..

echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}✓ Both servers are running!${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "${BLUE}API Docs:${NC}  http://localhost:8000/docs"
echo -e "${BLUE}Frontend:${NC}  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for interrupt
trap 'echo -e "\n${YELLOW}Stopping servers...${NC}"; kill $BACKEND_PID $FRONTEND_PID; exit 0' INT

wait
