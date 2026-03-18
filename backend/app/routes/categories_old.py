from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db import get_session
from app.models import Category, CategoryCreate
from app.services import CategoryService, GameService
from app.config import settings

router = APIRouter()


@router.post("/{game_id}/create", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    game_id: str,
    category_create: CategoryCreate,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Create a new category in a game.

    Requires admin password verification.
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

    return await CategoryService.create_category(session, game_id, category_create)


@router.get("/{game_id}/categories", response_model=List[Category])
async def get_game_categories(
    game_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get all categories in a game"""
    game = await GameService.get_game(session, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return await CategoryService.get_game_categories(session, game_id)


@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get category details"""
    category = await CategoryService.get_category(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return category
