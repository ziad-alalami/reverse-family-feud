import { useState, useEffect } from 'react'
import './App.css'
import Landing from './pages/Landing'
import GameContainer from './pages/GameContainer'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [gameId, setGameId] = useState(null)

  const handleJoinGame = (id) => {
    setGameId(id)
    setCurrentPage('game')
  }

  const handleCreateGame = () => {
    // Will be redirected by the create modal
  }

  const handleLogout = () => {
    setCurrentPage('landing')
    setGameId(null)
  }

  return (
    <div className="app-container">
      {currentPage !== 'landing' && (
        <button className="global-home-btn" onClick={handleLogout} title="Return to Home">
          🏠 Home
        </button>
      )}
      {currentPage === 'landing' && (
        <Landing onJoinGame={handleJoinGame} onCreateGame={handleCreateGame} />
      )}
      {currentPage === 'game' && (
        <GameContainer
          gameId={gameId}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
