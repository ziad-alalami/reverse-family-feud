import { useState, useEffect } from 'react'
import { gameAPI } from '../utils/api'
import './Modal.css'

export default function JoinGameModal({ onClose, onGameJoined }) {
  const [gameId, setGameId] = useState('')
  const [games, setGames] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGames, setLoadingGames] = useState(true)

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoadingGames(true)
        const response = await gameAPI.listGames()
        setGames(response.data)
      } catch (err) {
        console.error('Failed to load games:', err)
        setGames([])
      } finally {
        setLoadingGames(false)
      }
    }

    loadGames()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Verify game exists
      await gameAPI.getGame(gameId)
      onClose()
      onGameJoined(gameId)
    } catch (err) {
      setError(err.response?.data?.detail || 'Game not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGame = async (selectedGameId) => {
    try {
      setError('')
      setLoading(true)
      await gameAPI.getGame(selectedGameId)
      onClose()
      onGameJoined(selectedGameId)
    } catch (err) {
      setError(err.response?.data?.detail || 'Game not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join Existing Game</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Game ID</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              placeholder="Enter 6-character game ID"
              maxLength="6"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !gameId}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </form>

        <div className="divider">Available Games</div>

        <div className="games-list">
          {loadingGames ? (
            <div className="loading">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="no-games">No games available</div>
          ) : (
            <div className="games-container">
              {games.map((game) => (
                <button
                  key={game.id}
                  className="game-item"
                  onClick={() => handleSelectGame(game.id)}
                  disabled={loading}
                  type="button"
                >
                  <div className="game-title">{game.title}</div>
                  <div className="game-info">
                    <span className="game-id">ID: {game.id}</span>
                    <span className="game-admin">Admin: {game.admin_name}</span>
                  </div>
                  <div className="game-state">{game.state}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
