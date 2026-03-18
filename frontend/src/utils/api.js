import axios from 'axios'

const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const gameAPI = {
  listGames: () => apiClient.get('/games/'),
  createGame: (title, adminName, adminPassword) =>
    apiClient.post('/games/create', 
      { title, admin_name: adminName },
      { params: { admin_password: adminPassword } }
    ),
  getGame: (gameId) => apiClient.get(`/games/${gameId}`),
  getGameState: (gameId) => apiClient.get(`/games/${gameId}/state`),
  updateGameState: (gameId, newState, adminPassword) =>
    apiClient.put(`/games/${gameId}/state/${newState}`, {}, { params: { admin_password: adminPassword } }),
  deleteGame: (gameId, adminPassword) =>
    apiClient.delete(`/games/${gameId}`, { params: { admin_password: adminPassword } }),
}

export const playerAPI = {
  joinGame: (gameId, playerData, adminPassword) =>
    apiClient.post(`/players/${gameId}/join`, playerData, { params: { admin_password: adminPassword } }),
  getGamePlayers: (gameId) => apiClient.get(`/players/${gameId}/players`),
  getPlayer: (playerId) => apiClient.get(`/players/${playerId}`),
}

export const categoryAPI = {
  createCategory: (gameId, categoryData, adminPassword) =>
    apiClient.post(`/categories/${gameId}/create`, categoryData, { params: { admin_password: adminPassword } }),
  getGameCategories: (gameId) => apiClient.get(`/categories/${gameId}/categories`),
  getCategory: (categoryId) => apiClient.get(`/categories/${categoryId}`),
}

export const answerAPI = {
  submitAnswer: (playerAnswerData) => apiClient.post('/answers/submit', playerAnswerData),
  assignRank: (answerId, rank, adminPassword) =>
    apiClient.put(`/answers/${answerId}/assign-rank/${rank}`, {}, { params: { admin_password: adminPassword } }),
  getPlayerAnswers: (playerId) => apiClient.get(`/answers/player/${playerId}`),
  getCategoryAnswers: (categoryId) => apiClient.get(`/answers/category/${categoryId}`),
  getPlayerCategoryAnswer: (playerId, categoryId) =>
    apiClient.get(`/answers/player/${playerId}/category/${categoryId}`),
  getPlayerScore: (playerId) => apiClient.get(`/answers/player/${playerId}/score`),
}

export const wsAPI = {
  broadcastRankAssigned: (gameId, playerId, categoryId, rank, points) =>
    apiClient.post(`/ws/broadcast/${gameId}/rank-assigned`, { player_id: playerId, category_id: categoryId, rank, points }),
  broadcastScoreUpdate: (gameId, playerId) =>
    apiClient.post(`/ws/broadcast/${gameId}/score-update`, { player_id: playerId }),
  connectWebSocket: (gameId, playerId) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return new WebSocket(`${protocol}//${window.location.host}/api/ws/ws/${gameId}/${playerId}`)
  },
}

export default apiClient
