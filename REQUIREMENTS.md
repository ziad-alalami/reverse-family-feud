# EID Game - Setup Requirements

## System Requirements

### Minimum
- Python 3.11 or later
- Node.js 16.x or later
- 100MB free disk space
- Internet connection (for npm/pip packages)

### Recommended
- Python 3.12+
- Node.js 18+
- 500MB free disk space
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Installation Steps

### 1. Install Python
- **Windows**: Download from https://www.python.org/downloads/
- **Mac**: `brew install python3`
- **Linux**: `sudo apt install python3 python3-pip` (Ubuntu/Debian)

### 2. Install Node.js
- Download from https://nodejs.org
- Choose LTS version
- Includes npm automatically

### 3. Install uv (Python Package Manager)
```bash
pip install uv
```

### 4. Clone/Extract Project
```bash
# Navigate to project directory
cd eid-game
```

### 5. Run Application

#### Option A: Automated (Recommended)
```bash
# Linux/Mac
chmod +x start.sh
./start.sh

# Windows
start.bat
```

#### Option B: Manual
```bash
# Terminal 1 - Backend
cd backend
uv sync
uv run python run.py

# Terminal 2 - Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Verification

### Check Backend
```
curl http://localhost:8000/health
Expected: {"status":"ok"}
```

### Check Frontend
```
Open http://localhost:5173 in browser
Should see EID landing page
```

### Check API Documentation
```
Open http://localhost:8000/docs
Should see Swagger UI with all endpoints
```

## Troubleshooting Installation

### Python not found
```bash
# Add Python to PATH or use full path
C:\Python311\python.exe -m pip install uv  # Windows
/usr/local/bin/python3 -m pip install uv   # Mac/Linux
```

### uv command not found
```bash
# Reinstall uv
pip install --upgrade uv
```

### Node modules installation fails
```bash
# Clear npm cache
npm cache clean --force
npm install
```

### Port already in use
- Backend (8000): Change in `backend/app/config.py` → API_PORT
- Frontend (5173): Vite will find next available port

### Permission denied on start.sh
```bash
chmod +x start.sh
./start.sh
```

## Network Configuration

### Local Play (Same Network)
```
# Get your machine IP:
# Windows: ipconfig
# Mac/Linux: ifconfig

# Share with others: http://YOUR_IP:5173
```

### Port Forwarding (For Remote Access)
- Forward port 8000 (backend) and 5173 (frontend) in router
- Not recommended for production without HTTPS

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✓ Full support |
| Firefox | 88+     | ✓ Full support |
| Safari  | 14+     | ✓ Full support |
| Edge    | 90+     | ✓ Full support |
| IE11    | Any     | ✗ Not supported |

## Dependencies Installed

### Backend (Python)
- fastapi - Web framework
- uvicorn - Server
- pydantic - Data validation
- sqlalchemy - Database ORM
- aiosqlite - Async SQLite
- python-dotenv - Environment loading
- bcrypt - Password hashing

### Frontend (Node)
- react - UI library
- react-dom - React rendering
- axios - HTTP client
- vite - Build tool

## Environment Setup

### Backend .env
```
DATABASE_URL="sqlite+aiosqlite:///./eid_game.db"
ADMIN_PASSWORD="ILOVEPINACOLADA@2004"
DEBUG=True
CORS_ORIGINS='["http://localhost:3000", "http://localhost:5173", "*"]'
```

### Frontend .env (Optional)
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## First Run Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 16+ installed
- [ ] uv installed (`pip install uv`)
- [ ] Project extracted/cloned
- [ ] Backend running (`uv run python run.py`)
- [ ] Frontend running (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Can access http://localhost:8000/docs
- [ ] Can create a game
- [ ] Can join the game

## Getting Help

1. Check [QUICK_START.md](QUICK_START.md)
2. Check [README.md](README.md)
3. Read API docs at http://localhost:8000/docs
4. Check [IMPLEMENTATION.md](IMPLEMENTATION.md)

## Next Steps After Install

1. Create a test game
2. Add a test category
3. Invite a friend to join
4. Have fun playing!

---

**You're all set! Start the application and begin playing!** 🎮
