from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db import get_session
from app.models import Category, CategoryCreate, CategoryUpdate, RankAssignmentCreate, RankAssignment
from app.services import CategoryService, RankAssignmentService, GameService
from app.config import settings
from app.routes.websocket import broadcast_scores_update

router = APIRouter()


@router.post("/{game_id}/create", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    game_id: str,
    category_create: CategoryCreate,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Create a new category in a game with predefined answers.

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


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_update: CategoryUpdate,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Update a category (title, question, or answers).

    Requires admin password. Preserves existing rank assignments.
    """
    if admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin password",
        )

    category = await CategoryService.update_category(session, category_id, category_update)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


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
    """Get category details with all answers"""
    category = await CategoryService.get_category(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return category


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Delete a category.

    Requires admin password.
    """
    if admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin password",
        )

    success = await CategoryService.delete_category(session, category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return {"category_id": category_id, "deleted": True}


@router.post("/{category_id}/assign-rank")
async def assign_rank(
    category_id: str,
    rank_assignment: RankAssignmentCreate,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Assign a team to a rank in a category.

    Requires admin password.
    """
    if admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin password",
        )

    if rank_assignment.rank < 1 or rank_assignment.rank > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rank must be between 1 and 12",
        )

    # Get category to find game_id
    category = await CategoryService.get_category(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    assignment = await RankAssignmentService.assign_rank(
        session, category.game_id, category_id, rank_assignment.rank, rank_assignment.player_id
    )
    await broadcast_scores_update(category.game_id)
    return assignment


@router.delete("/{category_id}/assign-rank/{rank}")
async def remove_rank_assignment(
    category_id: str,
    rank: int,
    admin_password: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Remove team assignment from a rank.

    Requires admin password.
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

    # Get category to find game_id
    category = await CategoryService.get_category(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    success = await RankAssignmentService.remove_rank_assignment(session, category.game_id, category_id, rank)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No team assigned to this rank",
        )

    await broadcast_scores_update(category.game_id)
    return {"category_id": category_id, "rank": rank, "removed": True}

@router.get("/{category_id}/assign-rank", response_model=List[RankAssignment])
async def get_category_assignments(
    category_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get all rank assignments for a category"""
    category = await CategoryService.get_category(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return await RankAssignmentService.get_category_assignments(session, category_id)
