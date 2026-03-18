# EID Game - Competitive Gaming Platform

A modern, interactive gaming platform where players compete in categories with a unique inverted points system. The platform features real-time score updates via WebSockets and three distinct roles: Admin, Player, and Answer Viewer.

## Features

### Game Mechanics
- **N Categories**: Create unlimited game categories
- **Ranking System (1-12)**: Each rank assigns points equal to its rank
  - Ranks 1-10: Points = Rank value
  - Rank 11: -2 points (penalty)
  - Rank 12: -5 points (penalty)
- **Real-time Updates**: WebSocket-based score updates across all players

### Roles
1. **Admin**: Creates categories, defines ranked answers, reveals answers to players
2. **Player**: Submits answers (via external flow), competes with other players, views real-time scores on a dynamic synced dashboard
3. **Answer Viewer**: Views all answers and rankings in read-only mode (useful for spectators)

### Dynamic Dashboard
- **Synced Views**: When an admin selects a category or toggles "Reveal Answers", all player screens instantly update.
- **Team Rejoin**: Players can securely rejoin their existing team simply by entering the same team name.

### Responsive Design
- Optimized for both desktop and mobile devices
- Chrome-inspired dark theme with modern gradients
- Touch-friendly interface for phone play

## Project Structure

```
eid-game/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/      # Pydantic schemas
│   │   ├── db/          # SQLAlchemy ORM models & database config
│   │   ├── routes/      # API endpoints
│   │   ├── config.py    # Configuration
│   │   ├── services.py  # Business logic
│   │   └── main.py      # FastAPI app
│   ├── run.py           # Entry point
│   ├── .env             # Environment variables
│   └── pyproject.toml   # Dependencies
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page layouts
│   │   ├── utils/       # API client & utilities
│   │   ├── App.jsx      # Main app
│   │   └── main.jsx     # Entry point
│   ├── package.json     # Dependencies
│   ├── vite.config.js   # Vite configuration
│   └── index.html       # HTML template
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 16+
- `uv` package manager (for Python)
- `npm` or `yarn` (for Node dependencies)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies using uv:
```bash
uv sync
```

3. Create `.env` file (already provided with defaults):
```bash
# .env is pre-configured, adjust if needed
cat .env
```

4. Run the backend server:
```bash
uv run python run.py
```

The backend will start at `http://localhost:8000`

**API Documentation** (Swagger UI): `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

## Usage Flow

### 1. Landing Page
- **Create New Game**: Enter admin password (ILOVEPINACOLADA@2004) and create a new game
- **Enter Existing Game**: Join with game ID

### 2. Role Selection
After joining, select your role:
- **Admin**: Requires password verification
- **Player**: Enter name/group name, select color, add team members (optional)
- **Answer Viewer**: Requires password verification

### 3. Admin Workflow
1. Create categories with predefined ranked answers
2. View player submissions for each category
3. Click on a player's answer to assign a rank (1-12)
4. Points are automatically calculated and broadcast to all players

### 4. Player Workflow
1.  View game ID and your team information
2. See total score and category-specific scores
3. Submit answers for each category
4. Watch scores update in real-time as admin ranks answers

### 5. Answer Viewer Workflow
1. View all categories and their questions
2. See all submitted answers and their assigned ranks
3. Watch rankings and points (read-only, no actions possible)

## API Endpoints

### Games
- `POST /api/games/create` - Create new game (requires admin password)
- `GET /api/games/{game_id}` - Get game details
- `GET /api/games/{game_id}/state` - Get current game state
- `PUT /api/games/{game_id}/state/{new_state}` - Update game state (admin only)

### Players
- `POST /api/players/{game_id}/join` - Join game as player
- `GET /api/players/{game_id}/players` - Get all players in game
- `GET /api/players/{player_id}` - Get player details

### Categories
- `POST /api/categories/{game_id}/create` - Create category (admin only)
- `GET /api/categories/{game_id}/categories` - Get all categories in game
- `GET /api/categories/{category_id}` - Get category details

### Answers
- `POST /api/answers/submit` - Submit player answer
- `PUT /api/answers/{answer_id}/assign-rank/{rank}` - Assign rank to answer (admin only)
- `GET /api/answers/player/{player_id}` - Get player's answers
- `GET /api/answers/category/{category_id}` - Get category's answers
- `GET /api/answers/player/{player_id}/score` - Get player's total score

### WebSocket
- `WS /api/ws/ws/{game_id}/{player_id}` - Real-time updates for player

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **SQLite**: Lightweight database (configurable)
- **WebSockets**: Real-time communication
- **Uvicorn**: ASGI server

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **Axios**: HTTP client
- **CSS3**: Styling with modern features

## Security

### Admin Password
The admin password is hardcoded as `ILOVEPINACOLADA@2004`. In production:
- Use environment variables
- Implement proper authentication
- Use HTTPS/WSS
- Add JWT tokens
- Rate limiting

### Database
- Currently uses SQLite (great for development)
- For production, use PostgreSQL or MySQL
- Implement database backups
- Add migrations with Alembic

## Development Tips

### Reset Database
```bash
rm backend/eid_game.db
```

### View Database
```bash
cd backend
sqlite3 eid_game.db ".tables"
```

### Hot Reload
- Backend: Uvicorn auto-reloads on file changes
- Frontend: Vite hot module replacement enabled

## Browser Support

- Chrome/Chromium: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Edge: ✓ Full support
- IE11: ✗ Not supported

## Performance Notes

- WebSocket connections maintained per game session
- Real-time score updates sent to subscribed players only
- Database queries optimized with proper indexing
- Frontend bundled and minified in production

## Future Enhancements

- [ ] Game statistics and leaderboards
- [ ] Player ratings and history
- [ ] Multiple question types
- [ ] Media support (images, videos)
- [ ] Custom point systems
- [ ] Mobile app (React Native)
- [ ] Tournament mode
- [ ] Replay functionality
- [ ] Dark/Light theme toggle
- [ ] Internationalization (i18n)

## Troubleshooting

### WebSocket Connection Failed
- Ensure both frontend and backend are running
- Check CORS configuration in backend
- Verify WebSocket URL matches your domain

### Database Locked
- Only one process can write to SQLite
- Stop backend and restart
- Consider PostgreSQL for concurrent access

### CORS Errors
- Update `CORS_ORIGINS` in backend `.env`
- Ensure frontend URL is in the list

## License

This project is created as a custom gaming platform.

## Support

For issues or questions, please refer to the API documentation at `/docs` endpoint when backend is running.
