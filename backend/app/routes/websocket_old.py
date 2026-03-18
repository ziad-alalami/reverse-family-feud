from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import json
from typing import Dict, Set
import asyncio

from app.db import get_session
from app.services import PlayerService, PlayerAnswerService

router = APIRouter()

# Store active WebSocket connections per game
game_connections: Dict[str, Set[WebSocket]] = {}
player_to_game: Dict[str, str] = {}  # Map player_id to game_id


@router.websocket("/ws/{game_id}/{player_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: str,
    player_id: str,
    session: AsyncSession = Depends(get_session),
):
    """
    WebSocket endpoint for real-time game updates.

    Players connect with their player_id to receive score updates.
    Admin can broadcast rank assignments to update all players.
    """
    await websocket.accept()

    # Store connection
    if game_id not in game_connections:
        game_connections[game_id] = set()

    game_connections[game_id].add(websocket)
    player_to_game[player_id] = game_id

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            # For future expansion: handle other message types
            elif message.get("type") == "get_score":
                category_id = message.get("category_id")
                total_score = await PlayerAnswerService.get_player_total_score(session, player_id)

                response = {
                    "type": "score_update",
                    "player_id": player_id,
                    "total_score": total_score,
                }

                if category_id:
                    answer = await PlayerAnswerService.get_player_category_answer(
                        session, player_id, category_id
                    )
                    if answer:
                        response["category_score"] = {
                            "category_id": category_id,
                            "points": answer.points or 0,
                        }

                await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        # Remove connection
        if game_id in game_connections:
            game_connections[game_id].discard(websocket)
            if not game_connections[game_id]:
                del game_connections[game_id]

        if player_id in player_to_game:
            del player_to_game[player_id]


async def broadcast_to_game(game_id: str, message: dict):
    """Broadcast a message to all connected players in a game"""
    if game_id in game_connections:
        disconnected = set()
        for connection in game_connections[game_id]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                disconnected.add(connection)

        # Remove disconnected connections
        for connection in disconnected:
            game_connections[game_id].discard(connection)


@router.post("/broadcast/{game_id}/rank-assigned")
async def broadcast_rank_assigned(
    game_id: str,
    player_id: str,
    category_id: str,
    rank: int,
    points: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Broadcast a rank assignment to all players in the game.

    Called by admin after assigning a rank to a player.
    """
    # Get player info for display
    player = await PlayerService.get_player(session, player_id)

    message = {
        "type": "rank_assigned",
        "player_id": player_id,
        "player_name": player.name if player else "Unknown",
        "category_id": category_id,
        "rank": rank,
        "points": points,
    }

    await broadcast_to_game(game_id, message)
    return {"status": "broadcasted"}


@router.post("/broadcast/{game_id}/score-update")
async def broadcast_score_update(game_id: str, player_id: str, session: AsyncSession = Depends(get_session)):
    """
    Broadcast a player's total score update to all players in the game.
    """
    total_score = await PlayerAnswerService.get_player_total_score(session, player_id)
    player = await PlayerService.get_player(session, player_id)

    message = {
        "type": "score_update",
        "player_id": player_id,
        "player_name": player.name if player else "Unknown",
        "total_score": total_score,
    }

    await broadcast_to_game(game_id, message)
    return {"status": "broadcasted"}
