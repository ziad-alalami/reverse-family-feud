import uuid
import random
import string
import bcrypt
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from sqlalchemy.orm import selectinload

from app.db import GameModel, PlayerModel, CategoryModel, AnswerModel, PlayerAnswerModel
from app.models import Game, GameCreate, Player, PlayerCreate, Category, CategoryCreate, PlayerAnswer, PlayerAnswerCreate


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
    async def get_all_games(session: AsyncSession) -> List[Game]:
        """Get all non-deleted games"""
        result = await session.execute(
            select(GameModel).where(GameModel.deleted_at.is_(None)).order_by(GameModel.created_at.desc())
        )
        db_games = result.scalars().all()
        return [GameService._model_to_schema(db_game) for db_game in db_games]

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
        """Create a new player in a game"""
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
    def _model_to_schema(db_category: CategoryModel) -> Category:
        """Convert SQLAlchemy model to Pydantic schema"""
        answers = [
            {"rank": a.rank, "answer_text": a.answer_text}
            for a in sorted(db_category.answers, key=lambda x: x.rank)
        ]
        return Category(
            id=db_category.id,
            game_id=db_category.game_id,
            title=db_category.title,
            question=db_category.question,
            answers=answers,
            created_at=db_category.created_at,
        )


class PlayerAnswerService:
    @staticmethod
    async def submit_answer(session: AsyncSession, answer_create: PlayerAnswerCreate) -> PlayerAnswer:
        """Submit a player's answer to a category"""
        answer_id = str(uuid.uuid4())
        player = await session.execute(select(PlayerModel).where(PlayerModel.id == answer_create.player_id))
        player_obj = player.scalars().first()
        game_id = player_obj.game_id

        db_answer = PlayerAnswerModel(
            id=answer_id,
            game_id=game_id,
            player_id=answer_create.player_id,
            category_id=answer_create.category_id,
            answer_text=answer_create.answer_text,
        )
        session.add(db_answer)
        await session.commit()
        await session.refresh(db_answer)

        return PlayerAnswerService._model_to_schema(db_answer)

    @staticmethod
    async def assign_rank(session: AsyncSession, player_answer_id: str, rank: int) -> PlayerAnswer:
        """Assign a rank (1-12) to a player answer and calculate points"""
        # Calculate points
        if rank == 11:
            points = -2
        elif rank == 12:
            points = -5
        else:
            points = rank

        await session.execute(
            update(PlayerAnswerModel)
            .where(PlayerAnswerModel.id == player_answer_id)
            .values(
                assigned_rank=rank,
                points=points,
                updated_at=datetime.utcnow()
            )
        )
        await session.commit()

        # Fetch updated record
        result = await session.execute(select(PlayerAnswerModel).where(PlayerAnswerModel.id == player_answer_id))
        db_answer = result.scalars().first()
        return PlayerAnswerService._model_to_schema(db_answer)

    @staticmethod
    async def get_player_answers(session: AsyncSession, player_id: str) -> List[PlayerAnswer]:
        """Get all answers submitted by a player"""
        result = await session.execute(
            select(PlayerAnswerModel).where(PlayerAnswerModel.player_id == player_id)
        )
        db_answers = result.scalars().all()
        return [PlayerAnswerService._model_to_schema(a) for a in db_answers]

    @staticmethod
    async def get_category_answers(session: AsyncSession, category_id: str) -> List[PlayerAnswer]:
        """Get all answers in a category"""
        result = await session.execute(
            select(PlayerAnswerModel).where(PlayerAnswerModel.category_id == category_id)
        )
        db_answers = result.scalars().all()
        return [PlayerAnswerService._model_to_schema(a) for a in db_answers]

    @staticmethod
    async def get_player_category_answer(
        session: AsyncSession, player_id: str, category_id: str
    ) -> Optional[PlayerAnswer]:
        """Get a player's answer to a specific category"""
        result = await session.execute(
            select(PlayerAnswerModel).where(
                and_(
                    PlayerAnswerModel.player_id == player_id,
                    PlayerAnswerModel.category_id == category_id,
                )
            )
        )
        db_answer = result.scalars().first()
        if not db_answer:
            return None
        return PlayerAnswerService._model_to_schema(db_answer)

    @staticmethod
    async def get_player_total_score(session: AsyncSession, player_id: str) -> int:
        """Calculate total score for a player"""
        result = await session.execute(
            select(PlayerAnswerModel).where(
                and_(
                    PlayerAnswerModel.player_id == player_id,
                    PlayerAnswerModel.points.isnot(None)
                )
            )
        )
        db_answers = result.scalars().all()
        return sum(a.points for a in db_answers if a.points is not None)

    @staticmethod
    def _model_to_schema(db_answer: PlayerAnswerModel) -> PlayerAnswer:
        """Convert SQLAlchemy model to Pydantic schema"""
        return PlayerAnswer(
            id=db_answer.id,
            player_id=db_answer.player_id,
            category_id=db_answer.category_id,
            answer_text=db_answer.answer_text,
            assigned_rank=db_answer.assigned_rank,
            points=db_answer.points,
            created_at=db_answer.created_at,
            updated_at=db_answer.updated_at,
        )
