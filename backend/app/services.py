import uuid
import random
import string
import bcrypt
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from sqlalchemy.orm import selectinload

from app.db import GameModel, PlayerModel, CategoryModel, AnswerModel, RankAssignmentModel
from app.models import Game, GameCreate, Player, PlayerCreate, Category, CategoryCreate, CategoryUpdate, Answer, RankAssignment, RankAssignmentCreate, TeamScore


def generate_game_id() -> str:
    """Generate a random alphanumeric game ID like ABC123"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=6))


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def calculate_points(rank: int) -> int:
    """Calculate points for a rank"""
    if rank == 11:
        return -2
    elif rank == 12:
        return -5
    else:
        return rank


class GameService:
    @staticmethod
    async def create_game(session: AsyncSession, game_create: GameCreate, admin_password_hash: str) -> Game:
        """Create a new game"""
        game_id = generate_game_id()
        admin_id = str(uuid.uuid4())

        db_game = GameModel(
            id=game_id,
            title=game_create.title,
            admin_id=admin_id,
            admin_name=game_create.admin_name,
            state="setup"
        )
        session.add(db_game)
        await session.commit()
        await session.refresh(db_game)

        return GameService._model_to_schema(db_game)

    @staticmethod
    async def get_all_games(session: AsyncSession) -> List[Game]:
        """Get all non-deleted games"""
        result = await session.execute(
            select(GameModel).where(GameModel.deleted_at.is_(None)).order_by(GameModel.created_at.desc())
        )
        db_games = result.scalars().all()
        return [GameService._model_to_schema(db_game) for db_game in db_games]

    @staticmethod
    async def get_game(session: AsyncSession, game_id: str) -> Optional[Game]:
        """Get game by ID (non-deleted only)"""
        result = await session.execute(
            select(GameModel).where(
                (GameModel.id == game_id) & (GameModel.deleted_at.is_(None))
            )
        )
        db_game = result.scalars().first()

        if not db_game:
            return None

        return GameService._model_to_schema(db_game)

    @staticmethod
    async def get_game_state(session: AsyncSession, game_id: str) -> Optional[str]:
        """Get current game state"""
        result = await session.execute(
            select(GameModel.state).where(GameModel.id == game_id)
        )
        return result.scalars().first()

    @staticmethod
    async def update_game_state(session: AsyncSession, game_id: str, new_state: str):
        """Update game state"""
        await session.execute(
            update(GameModel).where(GameModel.id == game_id).values(
                state=new_state,
                updated_at=datetime.utcnow()
            )
        )
        await session.commit()

    @staticmethod
    async def delete_game(session: AsyncSession, game_id: str) -> bool:
        """Soft delete a game"""
        result = await session.execute(select(GameModel).where(GameModel.id == game_id))
        db_game = result.scalars().first()
        
        if not db_game:
            return False
        
        db_game.deleted_at = datetime.utcnow()
        session.add(db_game)
        await session.commit()
        return True

    @staticmethod
    async def get_team_scores(session: AsyncSession, game_id: str) -> List[TeamScore]:
        """Get all team scores for a game"""
        # Get all players
        players_result = await session.execute(
            select(PlayerModel).where(PlayerModel.game_id == game_id)
        )
        players = players_result.scalars().all()

        team_scores = []
        for player in players:
            # Get all rank assignments for this player in this game
            assignments_result = await session.execute(
                select(RankAssignmentModel).where(
                    and_(
                        RankAssignmentModel.game_id == game_id,
                        RankAssignmentModel.player_id == player.id
                    )
                )
            )
            assignments = assignments_result.scalars().all()

            total_points = sum(a.points for a in assignments)
            rank_assignments = [RankAssignmentService._model_to_schema(a) for a in assignments]

            team_score = TeamScore(
                player_id=player.id,
                player_name=player.name,
                color=player.color,
                total_points=total_points,
                rank_assignments=rank_assignments
            )
            team_scores.append(team_score)

        # Sort by total points descending
        return sorted(team_scores, key=lambda x: x.total_points, reverse=True)

    @staticmethod
    def _model_to_schema(db_game: GameModel) -> Game:
        """Convert SQLAlchemy model to Pydantic schema"""
        return Game(
            id=db_game.id,
            title=db_game.title,
            admin_id=db_game.admin_id,
            admin_name=db_game.admin_name,
            state=db_game.state,
            players=[],
            categories=[],
            created_at=db_game.created_at,
            updated_at=db_game.updated_at,
            deleted_at=db_game.deleted_at,
        )


class PlayerService:
    @staticmethod
    async def create_player(session: AsyncSession, game_id: str, player_create: PlayerCreate) -> Player:
        """Create a new player in a game, or return existing if name matches"""
        # First check if player/team already exists in this game by name
        result = await session.execute(
            select(PlayerModel).where(
                PlayerModel.game_id == game_id,
                PlayerModel.name == player_create.name
            )
        )
        existing_player = result.scalars().first()
        
        if existing_player:
            # Rejoining existing team, ignore other fields
            return PlayerService._model_to_schema(existing_player)
            
        # Create new team/player
        player_id = str(uuid.uuid4())
        team_members_json = ",".join(player_create.team_members) if player_create.team_members else None

        db_player = PlayerModel(
            id=player_id,
            game_id=game_id,
            name=player_create.name,
            role=player_create.role.value,
            team_members=team_members_json,
            color=player_create.color,
        )
        session.add(db_player)
        await session.commit()
        await session.refresh(db_player)

        return PlayerService._model_to_schema(db_player)

    @staticmethod
    async def get_game_players(session: AsyncSession, game_id: str) -> List[Player]:
        """Get all players in a game"""
        result = await session.execute(
            select(PlayerModel).where(PlayerModel.game_id == game_id)
        )
        db_players = result.scalars().all()
        return [PlayerService._model_to_schema(p) for p in db_players]

    @staticmethod
    async def get_player(session: AsyncSession, player_id: str) -> Optional[Player]:
        """Get a specific player"""
        result = await session.execute(select(PlayerModel).where(PlayerModel.id == player_id))
        db_player = result.scalars().first()
        if not db_player:
            return None
        return PlayerService._model_to_schema(db_player)

    @staticmethod
    def _model_to_schema(db_player: PlayerModel) -> Player:
        """Convert SQLAlchemy model to Pydantic schema"""
        team_members = db_player.team_members.split(",") if db_player.team_members else None
        return Player(
            id=db_player.id,
            game_id=db_player.game_id,
            name=db_player.name,
            role=db_player.role,
            team_members=team_members,
            color=db_player.color,
            created_at=db_player.created_at,
        )


class CategoryService:
    @staticmethod
    async def create_category(session: AsyncSession, game_id: str, category_create: CategoryCreate) -> Category:
        """Create a new category with predefined answers"""
        category_id = str(uuid.uuid4())

        db_category = CategoryModel(
            id=category_id,
            game_id=game_id,
            title=category_create.title,
            question=category_create.question,
        )
        session.add(db_category)

        # Add answers
        for answer in category_create.answers:
            db_answer = AnswerModel(
                id=str(uuid.uuid4()),
                category_id=category_id,
                rank=answer.rank,
                answer_text=answer.answer_text,
            )
            session.add(db_answer)

        await session.commit()
        await session.refresh(db_category, ["answers"])

        return CategoryService._model_to_schema(db_category)

    @staticmethod
    async def update_category(session: AsyncSession, category_id: str, category_update: CategoryUpdate) -> Optional[Category]:
        """Update a category"""
        result = await session.execute(
            select(CategoryModel).where(CategoryModel.id == category_id).options(selectinload(CategoryModel.answers))
        )
        db_category = result.scalars().first()

        if not db_category:
            return None

        # Update basic fields
        if category_update.title:
            db_category.title = category_update.title
        if category_update.question:
            db_category.question = category_update.question
        db_category.updated_at = datetime.utcnow()

        # Update answers if provided
        if category_update.answers:
            # Delete old answers
            await session.execute(
                select(AnswerModel).where(AnswerModel.category_id == category_id)
            )
            old_answers = result.scalars().all()
            for old_answer in old_answers:
                await session.delete(old_answer)

            # Add new answers
            for answer in category_update.answers:
                db_answer = AnswerModel(
                    id=str(uuid.uuid4()),
                    category_id=category_id,
                    rank=answer.rank,
                    answer_text=answer.answer_text,
                )
                session.add(db_answer)

        session.add(db_category)
        await session.commit()
        await session.refresh(db_category, ["answers"])

        return CategoryService._model_to_schema(db_category)

    @staticmethod
    async def get_game_categories(session: AsyncSession, game_id: str) -> List[Category]:
        """Get all categories in a game"""
        result = await session.execute(
            select(CategoryModel).where(CategoryModel.game_id == game_id).options(selectinload(CategoryModel.answers))
        )
        db_categories = result.scalars().all()
        return [CategoryService._model_to_schema(c) for c in db_categories]

    @staticmethod
    async def get_category(session: AsyncSession, category_id: str) -> Optional[Category]:
        """Get a specific category"""
        result = await session.execute(
            select(CategoryModel).where(CategoryModel.id == category_id).options(selectinload(CategoryModel.answers))
        )
        db_category = result.scalars().first()
        if not db_category:
            return None
        return CategoryService._model_to_schema(db_category)

    @staticmethod
    async def delete_category(session: AsyncSession, category_id: str) -> bool:
        """Delete a category"""
        result = await session.execute(select(CategoryModel).where(CategoryModel.id == category_id))
        db_category = result.scalars().first()

        if not db_category:
            return False

        await session.delete(db_category)
        await session.commit()
        return True

    @staticmethod
    def _model_to_schema(db_category: CategoryModel) -> Category:
        """Convert SQLAlchemy model to Pydantic schema"""
        answers = [
            Answer(rank=a.rank, answer_text=a.answer_text)
            for a in sorted(db_category.answers, key=lambda x: x.rank)
        ]
        return Category(
            id=db_category.id,
            game_id=db_category.game_id,
            title=db_category.title,
            question=db_category.question,
            answers=answers,
            created_at=db_category.created_at,
            updated_at=db_category.updated_at,
        )


class RankAssignmentService:
    @staticmethod
    async def assign_rank(session: AsyncSession, game_id: str, category_id: str, rank: int, player_id: str) -> RankAssignment:
        """Assign a team to a rank in a category"""
        assignment_id = str(uuid.uuid4())
        points = calculate_points(rank)

        db_assignment = RankAssignmentModel(
            id=assignment_id,
            game_id=game_id,
            category_id=category_id,
            rank=rank,
            player_id=player_id,
            points=points,
        )
        session.add(db_assignment)
        await session.commit()
        await session.refresh(db_assignment)

        return RankAssignmentService._model_to_schema(db_assignment)

    @staticmethod
    async def remove_rank_assignment(session: AsyncSession, game_id: str, category_id: str, rank: int) -> bool:
        """Remove team assignment from a rank"""
        result = await session.execute(
            select(RankAssignmentModel).where(
                and_(
                    RankAssignmentModel.game_id == game_id,
                    RankAssignmentModel.category_id == category_id,
                    RankAssignmentModel.rank == rank
                )
            )
        )
        db_assignment = result.scalars().first()

        if not db_assignment:
            return False

        await session.delete(db_assignment)
        await session.commit()
        return True

    @staticmethod
    async def get_category_assignments(session: AsyncSession, category_id: str) -> List[RankAssignment]:
        """Get all rank assignments for a category"""
        result = await session.execute(
            select(RankAssignmentModel).where(RankAssignmentModel.category_id == category_id).order_by(RankAssignmentModel.rank)
        )
        db_assignments = result.scalars().all()
        return [RankAssignmentService._model_to_schema(a) for a in db_assignments]

    @staticmethod
    def _model_to_schema(db_assignment: RankAssignmentModel) -> RankAssignment:
        """Convert SQLAlchemy model to Pydantic schema"""
        return RankAssignment(
            id=db_assignment.id,
            game_id=db_assignment.game_id,
            category_id=db_assignment.category_id,
            rank=db_assignment.rank,
            player_id=db_assignment.player_id,
            points=db_assignment.points,
            created_at=db_assignment.created_at,
            updated_at=db_assignment.updated_at,
        )
