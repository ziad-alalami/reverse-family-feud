import axios from 'axios';

const API_BASE = 'http://localhost:8002/api';

// Pass admin password via query param for endpoints that require it
const getAdminConfig = (password) => {
  return { params: { admin_password: password } };
};

// Games API
export const gameAPI = {
  createGame: (adminName, title) =>
    axios.post(`${API_BASE}/games/create`, {
      admin_name: adminName,
      title,
    }, getAdminConfig(import.meta.env.VITE_ADMIN_PASSWORD)),
  
  listGames: () => axios.get(`${API_BASE}/games/`),
  
  getGame: (gameId) => axios.get(`${API_BASE}/games/${gameId}`),
  
  getGameState: (gameId) => axios.get(`${API_BASE}/games/${gameId}/state`),
  
  updateGameState: (gameId, newState) =>
    axios.put(`${API_BASE}/games/${gameId}/state/${newState}`, {}, getAdminConfig(import.meta.env.VITE_ADMIN_PASSWORD)),
  
  deleteGame: (gameId) => axios.delete(`${API_BASE}/games/${gameId}`, getAdminConfig(import.meta.env.VITE_ADMIN_PASSWORD)),
  
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
  createCategory: (gameId, title, question, answers, adminPassword) =>
    axios.post(`${API_BASE}/categories/${gameId}/create`, {
      title,
      question,
      answers,
    }, getAdminConfig(adminPassword)),
  
  getCategoryList: (gameId) => axios.get(`${API_BASE}/categories/${gameId}/categories`),
  
  getCategory: (categoryId) => axios.get(`${API_BASE}/categories/${categoryId}`),
  
  updateCategory: (categoryId, title, question, answers, adminPassword) =>
    axios.put(`${API_BASE}/categories/${categoryId}`, {
      title,
      question,
      answers,
    }, getAdminConfig(adminPassword)),
  
  deleteCategory: (categoryId, adminPassword) => axios.delete(`${API_BASE}/categories/${categoryId}`, getAdminConfig(adminPassword)),
};

// Rank Assignment API
export const rankAssignmentAPI = {
  assignRank: (categoryId, rank, playerId, adminPassword) =>
    axios.post(`${API_BASE}/categories/${categoryId}/assign-rank`, {
      rank,
      player_id: playerId,
    }, getAdminConfig(adminPassword)),
  
  removeRankAssignment: (categoryId, rank, adminPassword) =>
    axios.delete(`${API_BASE}/categories/${categoryId}/assign-rank/${rank}`, getAdminConfig(adminPassword)),
  
  getCategoryAssignments: (categoryId) =>
    axios.get(`${API_BASE}/categories/${categoryId}/assign-rank`),
};
