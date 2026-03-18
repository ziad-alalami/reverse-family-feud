from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum

Base = declarative_base()


class RoleEnum(PyEnum):
    ADMIN = "admin"
    PLAYER = "player"
    ANSWER_VIEWER = "answer_viewer"


class GameModel(Base):
    __tablename__ = "games"

    id = Column(String(10), primary_key=True, unique=True)
    title = Column(String(255), nullable=False)
    admin_id = Column(String(36), nullable=False)
    admin_name = Column(String(255), nullable=False)
    state = Column(String(50), default="setup")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    players = relationship("PlayerModel", back_populates="game", cascade="all, delete-orphan")
    categories = relationship("CategoryModel", back_populates="game", cascade="all, delete-orphan")
    rank_assignments = relationship("RankAssignmentModel", back_populates="game", cascade="all, delete-orphan")


class PlayerModel(Base):
    __tablename__ = "players"

    id = Column(String(36), primary_key=True)
    game_id = Column(String(10), ForeignKey("games.id"), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    team_members = Column(Text, nullable=True)  # JSON string of team member names
    color = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    game = relationship("GameModel", back_populates="players")
    rank_assignments = relationship("RankAssignmentModel", back_populates="player", cascade="all, delete-orphan")


class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True)
    game_id = Column(String(10), ForeignKey("games.id"), nullable=False)
    title = Column(String(255), nullable=False)
    question = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    game = relationship("GameModel", back_populates="categories")
    answers = relationship("AnswerModel", back_populates="category", cascade="all, delete-orphan")
    rank_assignments = relationship("RankAssignmentModel", back_populates="category", cascade="all, delete-orphan")


class AnswerModel(Base):
    __tablename__ = "answers"

    id = Column(String(36), primary_key=True)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    rank = Column(Integer, nullable=False)
    answer_text = Column(Text, nullable=False)

    # Relationships
    category = relationship("CategoryModel", back_populates="answers")


class RankAssignmentModel(Base):
    __tablename__ = "rank_assignments"

    id = Column(String(36), primary_key=True)
    game_id = Column(String(10), ForeignKey("games.id"), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    rank = Column(Integer, nullable=False)  # 1-12
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)  # Team that answered
    points = Column(Integer, nullable=False)  # Auto-calculated: rank 1-10=rank, 11=-2, 12=-5
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    game = relationship("GameModel", back_populates="rank_assignments")
    category = relationship("CategoryModel", back_populates="rank_assignments")
    player = relationship("PlayerModel", back_populates="rank_assignments")
