import { useState } from 'react'
import './Landing.css'
import CreateGameModal from '../components/CreateGameModal'
import JoinGameModal from '../components/JoinGameModal'

export default function Landing({ onJoinGame, onCreateGame }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  const handleGameCreated = (gameId) => {
    onJoinGame(gameId)
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">EID</h1>
        <p className="landing-subtitle">Competitive Gaming Platform</p>

        <div className="landing-buttons">
          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowJoinModal(true)}
          >
            Enter Existing Game
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Game
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onGameCreated={handleGameCreated}
        />
      )}

      {showJoinModal && (
        <JoinGameModal
          onClose={() => setShowJoinModal(false)}
          onGameJoined={onJoinGame}
        />
      )}
    </div>
  )
}
