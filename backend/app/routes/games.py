from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db import get_session
from app.models import GameCreate, Game, TeamScore
from app.services import GameService, verify_password, hash_password
from app.config import settings

router = APIRouter()


@router.get("/", response_model=list[Game])
async def list_all_games(
    session: AsyncSession = Depends(get_session),
):
    """Get all existing non-deleted games"""
    games = await GameService.get_all_games(session)
    return games


@router.post("/create", response_model=Game, status_code=status.HTTP_201_CREATED)
async def create_game(
    game_create: GameCreate,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Create a new game.

    Requires admin password verification.
    """
    if admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin password",
        )

    password_hash = hash_password(admin_password)
    return await GameService.create_game(session, game_create, password_hash)


@router.get("/{game_id}", response_model=Game)
async def get_game(
    game_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get game details by ID"""
    game = await GameService.get_game(session, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    return game


@router.get("/{game_id}/state")
async def get_game_state(
    game_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get current game state"""
    state = await GameService.get_game_state(session, game_id)
    if state is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    return {"state": state}


@router.put("/{game_id}/state/{new_state}")
async def update_game_state(
    game_id: str,
    new_state: str,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Update game state.

    Requires admin password. Valid states: setup, active, ended
    """
    if admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin password",
        )

    if new_state not in ["setup", "active", "ended"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state",
        )

    game = await GameService.get_game(session, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    await GameService.update_game_state(session, game_id, new_state)
    return {"game_id": game_id, "new_state": new_state}


@router.delete("/{game_id}")
async def delete_game(
    game_id: str,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Soft delete a game.

    Requires admin password. Only admins can delete games.
    """
    if admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin password",
        )

    game = await GameService.get_game(session, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    await GameService.delete_game(session, game_id)
    return {"game_id": game_id, "deleted": True}


@router.get("/{game_id}/scores", response_model=List[TeamScore])
async def get_game_scores(
    game_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get all team scores for a game, sorted by total points"""
    game = await GameService.get_game(session, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return await GameService.get_team_scores(session, game_id)
