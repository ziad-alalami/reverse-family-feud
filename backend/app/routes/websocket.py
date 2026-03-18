from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import json
from typing import Dict, Set
import asyncio

from app.db import get_session
from app.services import GameService

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
    """
    await websocket.accept()

    if game_id not in game_connections:
        game_connections[game_id] = set()

    game_connections[game_id].add(websocket)
    player_to_game[player_id] = game_id

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            elif message.get("type") == "get_scores":
                scores = await GameService.get_team_scores(session, game_id)
                response = {
                    "type": "scores_update",
                    "game_id": game_id,
                    "scores": [
                        {
                            "player_id": score.player_id,
                            "player_name": score.player_name,
                            "color": score.color,
                            "total_points": score.total_points,
                            "rank_assignments": [{"category_id": a.category_id, "points": a.points} for a in score.rank_assignments]
                        }
                        for score in scores
                    ]
                }
                await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
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

        for connection in disconnected:
            game_connections[game_id].discard(connection)


@router.post("/broadcast/{game_id}/rank-assigned")
async def broadcast_rank_assigned(
    game_id: str,
    player_id: str,
    category_id: str,
    rank: int,
    points: int,
):
    """Broadcast when a rank is assigned to a team"""
    message = {
        "type": "rank_assigned",
        "game_id": game_id,
        "player_id": player_id,
        "category_id": category_id,
        "rank": rank,
        "points": points,
    }
    await broadcast_to_game(game_id, message)
    return {"broadcast": True}


@router.post("/broadcast/{game_id}/player-joined")
async def broadcast_player_joined(
    game_id: str,
    player_id: str,
    player_name: str,
    player_role: str,
    color: str,
):
    """Broadcast when a new player/team joins"""
    message = {
        "type": "player_joined",
        "game_id": game_id,
        "player_id": player_id,
        "player_name": player_name,
        "player_role": player_role,
        "color": color,
    }
    await broadcast_to_game(game_id, message)
    return {"broadcast": True}


@router.post("/broadcast/{game_id}/scores-update")
async def broadcast_scores_update(
    game_id: str,
):
    """Broadcast updated scores to all players in a game"""
    message = {
        "type": "scores_update_request",
        "game_id": game_id,
    }
    await broadcast_to_game(game_id, message)
    return {"broadcast": True}
