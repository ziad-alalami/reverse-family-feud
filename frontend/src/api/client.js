import axios from 'axios';

const API_BASE = 'http://localhost:8002/api';

// Games API
export const gameAPI = {
  createGame: (adminName, title) =>
    axios.post(`${API_BASE}/games/create`, {
      admin_name: adminName,
      title,
      admin_password: import.meta.env.VITE_ADMIN_PASSWORD,
    }),
  
  listGames: () => axios.get(`${API_BASE}/games/`),
  
  getGame: (gameId) => axios.get(`${API_BASE}/games/${gameId}`),
  
  getGameState: (gameId) => axios.get(`${API_BASE}/games/${gameId}/state`),
  
  updateGameState: (gameId, newState) =>
    axios.put(`${API_BASE}/games/${gameId}/state/${newState}`),
  
  deleteGame: (gameId) => axios.delete(`${API_BASE}/games/${gameId}`),
  
  getTeamScores: (gameId) => axios.get(`${API_BASE}/games/${gameId}/scores`),
};

// Players API
export const playerAPI = {
  createPlayer: (gameId, playerName, team, role = 'player') =>
    axios.post(`${API_BASE}/players/create`, {
      game_id: gameId,
      name: playerName,
      role,
      team_members: team || [playerName],
    }),
};

// Categories API
export const categoryAPI = {
  createCategory: (gameId, title, question, answers) =>
    axios.post(`${API_BASE}/categories/${gameId}/create`, {
      title,
      question,
      answers,
    }),
  
  getCategoryList: (gameId) => axios.get(`${API_BASE}/categories/${gameId}/categories`),
  
  getCategory: (categoryId) => axios.get(`${API_BASE}/categories/${categoryId}`),
  
  updateCategory: (categoryId, title, question, answers) =>
    axios.put(`${API_BASE}/categories/${categoryId}`, {
      title,
      question,
      answers,
    }),
  
  deleteCategory: (categoryId) => axios.delete(`${API_BASE}/categories/${categoryId}`),
};

// Rank Assignment API
export const rankAssignmentAPI = {
  assignRank: (categoryId, rank, playerId) =>
    axios.post(`${API_BASE}/categories/${categoryId}/assign-rank`, {
      rank,
      player_id: playerId,
    }),
  
  removeRankAssignment: (categoryId, rank) =>
    axios.delete(`${API_BASE}/categories/${categoryId}/assign-rank/${rank}`),
  
  getCategoryAssignments: (categoryId) =>
    axios.get(`${API_BASE}/categories/${categoryId}/assign-rank`),
};
