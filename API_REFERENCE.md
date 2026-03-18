# EID Game - Architecture & API Reference

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Player     │  │    Admin     │  │    Viewer    │           │
│  │    View      │  │    Panel     │  │    Panel     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│        │                 │                   │                   │
│        └─────────────────┴───────────────────┘                   │
│                         │                                        │
│                   React Frontend                                 │
│                   (Vite Bundle)                                  │
└─────────────────────────────────────────────────────────────────┘
         │                                          │
         │                                          │
    HTTP │ Rest API                        WebSocket │ Real-time
    JSON │ Axios                          Connection │
         │                                          │
┌─────────────────────────────────────────────────────────────────┐
│                     API Server Layer                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              FastAPI Application                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │  Games       │  │  Players     │  │  Categories  │  │    │
│  │  │  Endpoints   │  │  Endpoints   │  │  Endpoints   │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  │  ┌──────────────┐  ┌──────────────┐                     │    │
│  │  │  Answers     │  │  WebSocket   │                     │    │
│  │  │  Endpoints   │  │  Manager     │                     │    │
│  │  └──────────────┘  └──────────────┘                     │    │
│  │         │                  │                            │    │
│  │         └──────────────────┘                            │    │
│  └──────────────────────────────────────────────────────────┘    │
│         │                              │                         │
│         │ Business Logic              │ WebSocket               │
│         └──────────────────────────────┘ Broadcast              │
│         Services Layer                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  GameService  │  PlayerService  │  CategoryService  │   │   │
│  │  PlayerAnswerService                                │   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           │
                    SQLAlchemy ORM
                           │
┌─────────────────────────────────────────────────────────────────┐
│                  Database Layer                                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  SQLite (Development) / PostgreSQL (Production)       │    │
│  │                                                        │    │
│  │  Tables:                                               │    │
│  │  • games                                               │    │
│  │  • players                                             │    │
│  │  • categories                                          │    │
│  │  • answers                                             │    │
│  │  • player_answers                                      │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### Game
```python
{
  "id": "ABC123",           # 6-char alphanumeric
  "title": "Movie Night",
  "admin_id": "uuid",
  "admin_name": "John",
  "state": "active",        # setup, active, ended
  "players": [...],
  "categories": [...],
  "created_at": "2024-03-18T...",
  "updated_at": "2024-03-18T..."
}
```

### Player
```python
{
  "id": "uuid",
  "game_id": "ABC123",
  "name": "Team A",
  "role": "player",         # admin, player, answer_viewer
  "team_members": ["Alice", "Bob"],
  "color": "#3B82F6",
  "created_at": "2024-03-18T..."
}
```

### Category
```python
{
  "id": "uuid",
  "game_id": "ABC123",
  "title": "Best Movie",
  "question": "What is the best movie?",
  "answers": [
    {"rank": 1, "answer_text": "The Matrix"},
    {"rank": 2, "answer_text": "Inception"},
    ...
  ],
  "created_at": "2024-03-18T..."
}
```

### PlayerAnswer
```python
{
  "id": "uuid",
  "player_id": "uuid",
  "category_id": "uuid",
  "answer_text": "The Matrix",
  "assigned_rank": 1,       # null if not assigned
  "points": 1,              # calculated from rank
  "created_at": "2024-03-18T...",
  "updated_at": "2024-03-18T..."
}
```

## API Endpoints

### Games

#### Create Game
```
POST /api/games/create
Headers:
  Content-Type: application/json
QueryParams:
  admin_password=bananas

Body:
{
  "title": "Movie Night",
  "admin_name": "John"
}

Response: 201 Created
{
  "id": "ABC123",
  "title": "Movie Night",
  ...
}
```

#### Get Game
```
GET /api/games/{game_id}

Response: 200 OK
{
  "id": "ABC123",
  "title": "Movie Night",
  ...
}
```

#### Get Game State
```
GET /api/games/{game_id}/state

Response: 200 OK
{
  "state": "active"
}
```

#### Update Game State
```
PUT /api/games/{game_id}/state/{new_state}
QueryParams:
  admin_password=bananas

States: setup, active, ended

Response: 200 OK
{
  "game_id": "ABC123",
  "new_state": "active"
}
```

### Players

#### Join Game
```
POST /api/players/{game_id}/join
Headers:
  Content-Type: application/json

Body:
{
  "name": "Team A",
  "role": "player",
  "team_members": ["Alice", "Bob"],
  "color": "#3B82F6"
}

Response: 201 Created
{
  "id": "uuid",
  "game_id": "ABC123",
  "name": "Team A",
  ...
}
```

#### Get Game Players
```
GET /api/players/{game_id}/players

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Team A",
    ...
  }
]
```

#### Get Player
```
GET /api/players/{player_id}

Response: 200 OK
{
  "id": "uuid",
  "name": "Team A",
  ...
}
```

### Categories

#### Create Category
```
POST /api/categories/{game_id}/create
Headers:
  Content-Type: application/json
QueryParams:
  admin_password=ILOVEPINACOLADA@2004

Body:
{
  "title": "Best Movie",
  "question": "What is the best movie?",
  "answers": [
    {"rank": 1, "answer_text": "The Matrix"},
    {"rank": 2, "answer_text": "Inception"},
    ...
    {"rank": 11, "answer_text": "Bad Movie 1"},
    {"rank": 12, "answer_text": "Bad Movie 2"}
  ]
}

Response: 201 Created
{
  "id": "uuid",
  "game_id": "ABC123",
  ...
}
```

#### Get Game Categories
```
GET /api/categories/{game_id}/categories

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Best Movie",
    ...
  }
]
```

#### Get Category
```
GET /api/categories/{category_id}

Response: 200 OK
{
  "id": "uuid",
  "title": "Best Movie",
  "answers": [...]
}
```

### Answers

#### Submit Answer
```
POST /api/answers/submit
Headers:
  Content-Type: application/json

Body:
{
  "player_id": "uuid",
  "category_id": "uuid",
  "answer_text": "The Matrix"
}

Response: 201 Created
{
  "id": "uuid",
  "player_id": "uuid",
  "answer_text": "The Matrix",
  "assigned_rank": null,
  "points": null,
  ...
}
```

#### Assign Rank
```
PUT /api/answers/{answer_id}/assign-rank/{rank}
QueryParams:
  admin_password=ILOVEPINACOLADA@2004
  rank=1

Response: 200 OK
{
  "id": "uuid",
  "assigned_rank": 1,
  "points": 1,
  ...
}
```

#### Get Player Answers
```
GET /api/answers/player/{player_id}

Response: 200 OK
[
  {
    "id": "uuid",
    "answer_text": "The Matrix",
    "assigned_rank": 1,
    "points": 1,
    ...
  }
]
```

#### Get Category Answers
```
GET /api/answers/category/{category_id}

Response: 200 OK
[
  {
    "id": "uuid",
    "player_id": "uuid",
    "answer_text": "The Matrix",
    ...
  }
]
```

#### Get Player Category Answer
```
GET /api/answers/player/{player_id}/category/{category_id}

Response: 200 OK
{
  "id": "uuid",
  "answer_text": "The Matrix",
  ...
}
```

#### Get Player Score
```
GET /api/answers/player/{player_id}/score

Response: 200 OK
{
  "player_id": "uuid",
  "total_score": 45
}
```

### WebSocket

#### Connect
```
WS /api/ws/ws/{game_id}/{player_id}

Connection established
```

#### Ping (Keep-alive)
```
Client sends:
{
  "type": "ping"
}

Server responds:
{
  "type": "pong"
}
```

#### Score Update Message
```
Server broadcasts:
{
  "type": "score_update",
  "player_id": "uuid",
  "player_name": "Team A",
  "total_score": 45,
  "category_score": {
    "category_id": "uuid",
    "points": 10
  }
}
```

#### Rank Assigned Message
```
Server broadcasts:
{
  "type": "rank_assigned",
  "player_id": "uuid",
  "player_name": "Team A",
  "category_id": "uuid",
  "rank": 1,
  "points": 1
}
```

## Points Calculation Logic

```python
def calculate_points(rank):
    if rank == 11:
        return -2
    elif rank == 12:
        return -5
    else:
        return rank
```

| Rank | Points |
|------|--------|
| 1    | 1      |
| 2    | 2      |
| ...  | ...    |
| 10   | 10     |
| 11   | -2     |
| 12   | -5     |

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 403 Forbidden
```json
{
  "detail": "Invalid admin password"
}
```

### 404 Not Found
```json
{
  "detail": "Game not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Authentication

### Admin Password
- Used for: Game creation, category creation, rank assignment, admin/viewer roles
- Default: `ILOVEPINACOLADA@2004`
- Passed as: `?admin_password=...` query parameter

### Player Identification
- No authentication needed
- Identified by: `player_id` in URL/body
- Anyone with game ID can join and get player ID

## Real-time Flow

1. **Player Connects**
   ```
   WS /api/ws/ws/{game_id}/{player_id}
   → Connection established
   → Player ready for updates
   ```

2. **Player Submits Answer**
   ```
   POST /api/answers/submit
   → Answer stored
   → WebSocket connections tracked
   ```

3. **Admin Assigns Rank**
   ```
   PUT /api/answers/{answer_id}/assign-rank/{rank}
   → Rank assigned
   → Points calculated
   → POST /api/ws/broadcast/{game_id}/rank-assigned
   ```

4. **Score Broadcast**
   ```
   WebSocket broadcast to all players in game
   {
     "type": "rank_assigned",
     "player_id": "uuid",
     "points": 5,
     ...
   }
   → Players update UI
   → Scores displayed in real-time
   ```

## Performance Notes

- **Database**: Indexed on common queries
- **WebSocket**: Broadcast only to connected players
- **API**: Async/await for concurrent operations
- **Frontend**: React hooks for efficient re-renders

## Testing API

### Using Swagger UI
```
http://localhost:8000/docs
```

### Using curl
```bash
# Create game
curl -X POST http://localhost:8000/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","admin_name":"Admin"}' \
  -G --data-urlencode 'admin_password=ILOVEPINACOLADA@2004'

# Join game
curl -X POST http://localhost:8000/api/players/ABC123/join \
  -H "Content-Type: application/json" \
  -d '{"name":"Player1","role":"player","color":"#3B82F6"}'
```

---

**Complete API reference for EID Game platform**
