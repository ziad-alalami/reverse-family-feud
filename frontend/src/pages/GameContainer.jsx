import { useState, useEffect } from 'react'
import './GameContainer.css'
import RoleSelectionPanel from '../components/RoleSelectionPanel'
import PlayerView from '../components/PlayerView'
import AdminPanel from '../components/AdminPanel'
import AnswerViewerPanel from '../components/AnswerViewerPanel'

export default function GameContainer({ gameId, onLogout }) {
  const [step, setStep] = useState('role-selection') // role-selection or game
  const [playerId, setPlayerId] = useState(null)
  const [playerRole, setPlayerRole] = useState(null)
  const [playerData, setPlayerData] = useState(null)

  const handleRoleSelected = (role, id, data) => {
    setPlayerRole(role)
    setPlayerId(id)
    setPlayerData(data)
    setStep('game')
  }

  const handleLogoutInternal = () => {
    setStep('role-selection')
    setPlayerId(null)
    setPlayerRole(null)
    setPlayerData(null)
  }

  const finalLogout = () => {
    handleLogoutInternal()
    onLogout()
  }

  if (step === 'role-selection') {
    return (
      <RoleSelectionPanel
        gameId={gameId}
        onRoleSelected={handleRoleSelected}
        onLogout={finalLogout}
      />
    )
  }

  if (step === 'game' && playerRole) {
    return (
      <div className="game-container">
        {playerRole === 'admin' && (
          <AdminPanel gameId={gameId} playerId={playerId} onLogout={handleLogoutInternal} playerData={playerData} />
        )}
        {playerRole === 'player' && (
          <PlayerView gameId={gameId} playerId={playerId} onLogout={handleLogoutInternal} playerData={playerData} />
        )}
        {playerRole === 'answer_viewer' && (
          <AnswerViewerPanel gameId={gameId} playerId={playerId} onLogout={handleLogoutInternal} playerData={playerData} />
        )}
      </div>
    )
  }

  return null
}
