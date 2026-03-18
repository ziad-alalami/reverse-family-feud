# Quick Start Guide

Get the EID Game up and running in minutes!

## Option 1: Automated Start (Linux/Mac)

```bash
chmod +x start.sh
./start.sh
```

This will:
1. Install all Python dependencies with `uv`
2. Install all Node dependencies with `npm`
3. Start the backend server on `http://localhost:8000`
4. Start the frontend server on `http://localhost:5173`

## Option 2: Automated Start (Windows)

```bash
start.bat
```

This will open two command prompt windows and start both servers.

## Option 3: Manual Start

### Terminal 1 - Backend

```bash
cd backend
uv sync
uv run python run.py
```

Backend will start at: `http://localhost:8000`

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at: `http://localhost:5173`

---

## First Time Setup

1. **Clone/Extract the repository**

2. **Ensure prerequisites are installed:**
   - Python 3.11+ → [Download](https://www.python.org)
   - Node.js 16+ → [Download](https://nodejs.org)
   - Git → [Download](https://git-scm.com)

3. **Run the application using one of the options above**

4. **Access the app:**
   - Frontend: http://localhost:5173
   - API Documentation: http://localhost:8000/docs

---

## First Game

### Step 1: Create a Game
- Click "Create New Game"
- Enter admin password: `bananas`
- Give your game a name
- You'll get a 6-character Game ID

### Step 2: Create Categories (Admin)
- Click "Add Category"
- Title: e.g., "Best Movie"
- Question: e.g., "What is the best movie ever?"
- Define answers for each rank 1-12
- Save

### Step 3: Invite Players
- Share the Game ID with others
- They enter the Game ID and choose "Player" role
- They enter their name/team and select a color

### Step 4: Play
- Players see the category and submit answers
- Admin reveals answers by assigning ranks
- Scores update in real-time!

---

## Admin Mode Features

- Create unlimited categories
- View all player submissions
- Assign ranks (1-12) to submissions
- Broadcast score updates in real-time
- View category details before revealing answers

## Player Mode Features

- Submit answers for each category
- Watch scores update live
- See category rankings
- Play solo or as a team
- All team members share the same score

## Answer Viewer Mode

- View all categories and questions
- See all submitted answers
- Watch rankings develop
- Read-only (no actions)
- Great for spectators/live viewers

---

## Troubleshooting

### "Connection refused" error
- Make sure both servers are running
- Check http://localhost:8000/health

### "Database is locked"
- Stop the backend
- Delete `backend/eid_game.db` (will recreate on restart)
- Start backend again

### WebSocket connection fails
- Check browser console for errors
- Ensure backend is running at http://localhost:8000
- Try refreshing the page

### Port already in use
- Backend: Change port in `backend/app/config.py` (default: 8000)
- Frontend: Vite will use next available port if 5173 is taken

---

## Keyboard Shortcuts

(To be implemented)

## API Testing

Use the built-in Swagger UI:
- Visit http://localhost:8000/docs
- Try out all endpoints
- See request/response examples

---

## Tips for Better Experience

1. **Mobile Players**: Open frontend URL on phones using your computer's IP
   - Get IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Share: `http://YOUR_IP:5173`

2. **Large Displays**: Open admin panel and answer viewer on separate monitors

3. **Smooth Gameplay**: 
   - Create categories before starting
   - Have admin pre-define good ranks
   - Use clear, concise questions

4. **Teams**: Add multiple members with different colors for visual clarity

---

## Next Steps

- Read the full [README.md](README.md) for complete documentation
- Check [API documentation](http://localhost:8000/docs) for all endpoints
- Explore the source code in `backend/app` and `frontend/src`

---

## Need Help?

1. Check the main README.md
2. Review API docs at `/docs` endpoint
3. Check browser console for detailed error messages
4. Ensure all prerequisites are installed

Enjoy playing! 🎮
