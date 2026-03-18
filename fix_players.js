const fs = require('fs');
let code = fs.readFileSync('backend/app/services.py', 'utf8');

const newCreatePlayer = `    @staticmethod
    async def create_player(session: AsyncSession, game_id: str, player_create: PlayerCreate) -> Player:
        """Create a new player in a game, or return existing if name matches"""
        # First check if player/team already exists in this game by name
        result = await session.execute(
            select(PlayerModel).where(
                PlayerModel.game_id == game_id,
                PlayerModel.name == player_create.name
            )
        )
        existing_player = result.scalar_one_or_none()
        
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

        return PlayerService._model_to_schema(db_player)`;

code = code.replace(/    @staticmethod\s+async def create_player[\s\S]*?await session\.refresh\(db_player\)\n\n        return PlayerService\._model_to_schema\(db_player\)/, newCreatePlayer);
fs.writeFileSync('backend/app/services.py', code);
