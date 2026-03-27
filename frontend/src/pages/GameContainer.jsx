import { useState, useEffect } from 'react'
import './GameContainer.css'
import RoleSelectionPanel from '../components/RoleSelectionPanel'
import PlayerView from '../components/PlayerView'
import AdminPanel from '../components/AdminPanel'
import AnswerViewerPanel from '../components/AnswerViewerPanel'

export default function GameContainer({ gameId, onLogout }) {
  const [step, setStep] = useState(() => localStorage.getItem('gc_step') || 'role-selection')
  const [playerId, setPlayerId] = useState(() => localStorage.getItem('gc_playerId') || null)
  const [playerRole, setPlayerRole] = useState(() => localStorage.getItem('gc_playerRole') || null)
  const [playerData, setPlayerData] = useState(() => {
    const data = localStorage.getItem('gc_playerData')
    return data ? JSON.parse(data) : null
  })
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('gc_adminPassword') || null)

  useEffect(() => {
    localStorage.setItem('gc_step', step)
    if (playerId) localStorage.setItem('gc_playerId', playerId)
    else localStorage.removeItem('gc_playerId')
    
    if (playerRole) localStorage.setItem('gc_playerRole', playerRole)
    else localStorage.removeItem('gc_playerRole')

    if (playerData) localStorage.setItem('gc_playerData', JSON.stringify(playerData))
    else localStorage.removeItem('gc_playerData')

    if (adminPassword) localStorage.setItem('gc_adminPassword', adminPassword)
    else localStorage.removeItem('gc_adminPassword')
  }, [step, playerId, playerRole, playerData, adminPassword])

  const handleRoleSelected = (role, id, data, password) => {
    setPlayerRole(role)
    setPlayerId(id)
    setPlayerData(data)
    if (password) {
      setAdminPassword(password)
    }
    setStep('game')
  }

  const handleLogoutInternal = () => {
    setStep('role-selection')
    setPlayerId(null)
    setPlayerRole(null)
    setPlayerData(null)
    setAdminPassword(null)
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
          <AdminPanel gameId={gameId} playerId={playerId} adminPassword={adminPassword} onLogout={handleLogoutInternal} playerData={playerData} />
        )}
        {playerRole === 'player' && (
          <PlayerView gameId={gameId} playerId={playerId} onLogout={handleLogoutInternal} playerData={playerData} />
        )}
        {playerRole === 'answer_viewer' && (
          <AnswerViewerPanel gameId={gameId} playerId={playerId} adminPassword={adminPassword} onLogout={handleLogoutInternal} playerData={playerData} />
        )}
      </div>
    )
  }

  return null
}
