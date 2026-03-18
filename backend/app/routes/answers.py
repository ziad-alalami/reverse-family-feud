from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db import get_session
from app.models import PlayerAnswer, PlayerAnswerCreate
from app.services import PlayerAnswerService, PlayerService, CategoryService
from app.config import settings

router = APIRouter()


@router.post("/submit", response_model=PlayerAnswer, status_code=status.HTTP_201_CREATED)
async def submit_answer(
    answer_create: PlayerAnswerCreate,
    session: AsyncSession = Depends(get_session),
):
    """Submit a player's answer to a category"""
    # Verify player exists
    player = await PlayerService.get_player(session, answer_create.player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )

    # Verify category exists
    category = await CategoryService.get_category(session, answer_create.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return await PlayerAnswerService.submit_answer(session, answer_create)


@router.put("/{answer_id}/assign-rank/{rank}", response_model=PlayerAnswer)
async def assign_rank(
    answer_id: str,
    rank: int,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Assign a rank (1-12) to a player answer.

    Requires admin password verification.
    """
    if admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin password",
        )

    if rank < 1 or rank > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rank must be between 1 and 12",
        )

    return await PlayerAnswerService.assign_rank(session, answer_id, rank)


@router.get("/player/{player_id}", response_model=List[PlayerAnswer])
async def get_player_answers(
    player_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get all answers submitted by a player"""
    player = await PlayerService.get_player(session, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )

    return await PlayerAnswerService.get_player_answers(session, player_id)


@router.get("/category/{category_id}", response_model=List[PlayerAnswer])
async def get_category_answers(
    category_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get all answers in a category"""
    category = await CategoryService.get_category(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return await PlayerAnswerService.get_category_answers(session, category_id)


@router.get("/player/{player_id}/category/{category_id}", response_model=PlayerAnswer)
async def get_player_category_answer(
    player_id: str,
    category_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get a player's answer to a specific category"""
    player = await PlayerService.get_player(session, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )

    answer = await PlayerAnswerService.get_player_category_answer(session, player_id, category_id)
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found",
        )

    return answer


@router.get("/player/{player_id}/score")
async def get_player_score(
    player_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get total score for a player"""
    player = await PlayerService.get_player(session, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )

    total_score = await PlayerAnswerService.get_player_total_score(session, player_id)
    return {"player_id": player_id, "total_score": total_score}
