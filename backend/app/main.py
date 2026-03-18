from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import init_db, get_session
from app import models
from app.routes import games, players, categories, websocket
from app.config import settings

app = FastAPI(title="EID Game API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    await init_db()


# Include routers
app.include_router(games.router, prefix="/api/games", tags=["games"])
app.include_router(players.router, prefix="/api/players", tags=["players"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(websocket.router, prefix="/api/ws", tags=["websocket"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
