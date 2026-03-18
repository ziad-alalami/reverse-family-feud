from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db import get_session
from app.models import Player, PlayerCreate
from app.services import PlayerService, GameService
from app.config import settings

router = APIRouter()


@router.post("/{game_id}/join", response_model=Player, status_code=status.HTTP_201_CREATED)
async def join_game(
    game_id: str,
    player_create: PlayerCreate,
    admin_password: str = None,
    session: AsyncSession = Depends(get_session),
):
    """
    Join an existing game as a player.

    Requires game to exist. If joining as admin or answer_viewer, requires valid admin password.
    """
    if player_create.role in ["admin", "answer_viewer"]:
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

    return await PlayerService.create_player(session, game_id, player_create)


@router.get("/{game_id}/players", response_model=List[Player])
async def get_game_players(
    game_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get all players in a game"""
    game = await GameService.get_game(session, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return await PlayerService.get_game_players(session, game_id)


@router.get("/{player_id}", response_model=Player)
async def get_player(
    player_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get player details"""
    player = await PlayerService.get_player(session, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    return player
