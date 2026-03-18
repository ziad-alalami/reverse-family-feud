from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional
from datetime import datetime


class Role(str, Enum):
    ADMIN = "admin"
    PLAYER = "player"
    ANSWER_VIEWER = "answer_viewer"


class Answer(BaseModel):
    """Represents a predefined answer for a specific rank in a category"""
    rank: int = Field(..., ge=1, le=12)
    answer_text: str

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    """DTO for creating a new category"""
    title: str
    question: str
    answers: List[Answer]


class CategoryUpdate(BaseModel):
    """DTO for updating a category"""
    title: Optional[str] = None
    question: Optional[str] = None
    answers: Optional[List[Answer]] = None


class Category(CategoryCreate):
    """Represents a game category with predefined ranked answers"""
    id: str
    game_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlayerCreate(BaseModel):
    """DTO for creating a player/group"""
    name: str
    role: Role
    team_members: Optional[List[str]] = None
    color: str  # hex color or color name


class Player(PlayerCreate):
    """Represents a player or team in a game"""
    id: str
    game_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class RankAssignmentCreate(BaseModel):
    """DTO for assigning a team to a rank in a category"""
    player_id: str
    rank: int = Field(..., ge=1, le=12)


class RankAssignment(BaseModel):
    """Represents a team's answer for a specific rank in a category"""
    id: str
    game_id: str
    category_id: str
    rank: int
    player_id: str
    points: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GameCreate(BaseModel):
    """DTO for creating a new game"""
    title: str
    admin_name: str


class TeamScore(BaseModel):
    """Represents a team's score in the game"""
    player_id: str
    player_name: str
    color: str
    total_points: int
    rank_assignments: List[RankAssignment] = []

    class Config:
        from_attributes = True


class GameState(str, Enum):
    """Game state progression"""
    SETUP = "setup"  # Admin setting up categories
    ACTIVE = "active"  # Players answering, admin revealing
    ENDED = "ended"


class Game(BaseModel):
    """Represents a game"""
    id: str
    title: str
    admin_id: str
    admin_name: str
    state: GameState
    players: List[Player]
    categories: List[Category]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
