import { useState } from 'react'
import { playerAPI } from '../utils/api'
import { COLOR_PALETTE } from '../utils/constants'
import './RoleSelectionPanel.css'

export default function RoleSelectionPanel({ gameId, onRoleSelected, onLogout }) {
  const [step, setStep] = useState('role') // role or player-setup
  const [selectedRole, setSelectedRole] = useState(null)
  const [password, setPassword] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [teamMembers, setTeamMembers] = useState([])
  const [newMember, setNewMember] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    if (role === 'player') {
      setStep('player-setup')
    } else {
      setStep('password')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Admin or answer viewer - create player record
    setLoading(true)
    try {
      const playerData = {
        name: selectedRole === 'admin' ? 'Admin' : 'Answer Viewer',
        role: selectedRole,
        team_members: null,
        color: selectedColor,
      }

      const response = await playerAPI.joinGame(gameId, playerData, password)
      onRoleSelected(selectedRole, response.data.id, playerData)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join game')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = () => {
    if (newMember.trim()) {
      setTeamMembers([...teamMembers, newMember])
      setNewMember('')
    }
  }

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const handlePlayerSetup = async (e) => {
    e.preventDefault()
    setError('')

    if (!playerName.trim()) {
      setError('Player/Group name is required')
      return
    }

    setLoading(true)
    try {
      const playerData = {
        name: playerName,
        role: 'player',
        team_members: teamMembers.length > 0 ? teamMembers : null,
        color: selectedColor,
      }

      const response = await playerAPI.joinGame(gameId, playerData)
      onRoleSelected('player', response.data.id, playerData)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join game')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'role') {
    return (
      <div className="role-selection-container">
        <div className="role-selection-content">
          <h1>Select Your Role</h1>
          <p className="role-subtitle">Game ID: <strong>{gameId}</strong></p>

          <div className="role-buttons">
            <button
              className="role-btn role-admin"
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="role-icon">👨‍💼</div>
              <div className="role-name">Admin</div>
              <div className="role-desc">Create categories & reveal answers</div>
            </button>

            <button
              className="role-btn role-player"
              onClick={() => handleRoleSelect('player')}
            >
              <div className="role-icon">🎮</div>
              <div className="role-name">Player</div>
              <div className="role-desc">Submit answers & compete</div>
            </button>

            <button
              className="role-btn role-viewer"
              onClick={() => handleRoleSelect('answer_viewer')}
            >
              <div className="role-icon">👁️</div>
              <div className="role-name">Answer Viewer</div>
              <div className="role-desc">View all answers (read-only)</div>
            </button>
          </div>

          <button className="btn btn-secondary logout-btn" onClick={onLogout}>
            Back
          </button>
        </div>
      </div>
    )
  }

  if (step === 'password') {
    return (
      <div className="role-selection-container">
        <div className="role-selection-content">
          <h1>Admin Password</h1>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Enter admin password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setStep('role')
                  setSelectedRole(null)
                  setPassword('')
                }}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Enter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (step === 'player-setup') {
    return (
      <div className="role-selection-container">
        <div className="role-selection-content player-setup">
          <h1>Join as Player</h1>

          <form onSubmit={handlePlayerSetup}>
            <div className="form-group">
              <label>Player / Group Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name or group name"
              />
            </div>

            <div className="form-group">
              <label>Team Members (Optional)</label>
              <div className="team-input-group">
                <input
                  type="text"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  placeholder="Add a member name"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddMember}
                >
                  Add Member +
                </button>
              </div>

              {teamMembers.length > 0 && (
                <div className="team-members-list">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="team-member">
                      <span>{member}</span>
                      <button
                        type="button"
                        className="remove-member-btn"
                        onClick={() => handleRemoveMember(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Select Color</label>
              <div className="color-palette">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setStep('role')
                  setSelectedRole(null)
                }}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}
