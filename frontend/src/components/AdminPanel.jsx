import { useState, useEffect } from 'react'
import { categoryAPI, rankAssignmentAPI, playerAPI, gameAPI } from '../api/client'
import './AdminPanel.css'

export default function AdminPanel({ gameId, playerId, adminPassword, onLogout, playerData }) {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [players, setPlayers] = useState([])
  const [rankAssignments, setRankAssignments] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [categoryTitle, setCategoryTitle] = useState('')
  const [categoryQuestion, setCategoryQuestion] = useState('')
  const [categoryAnswers, setCategoryAnswers] = useState(
    Array.from({ length: 12 }, (_, i) => '')
  )

  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/api/ws/ws/${gameId}/${playerId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "player_joined" && message.player_role !== "admin") {
        setPlayers(prev => {
          const exists = prev.find(p => p.id === message.player_id);
          if (exists) return prev;
          return [...prev, { id: message.player_id, name: message.player_name, role: message.player_role, color: message.color }];
        });
      }
    };
    return () => websocket.close();
  }, [gameId, playerId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, playersRes] = await Promise.all([
          categoryAPI.getCategoryList(gameId),
          playerAPI.getGamePlayers?.(gameId) || Promise.resolve({ data: [] }),
        ])

        setCategories(categoriesRes.data)
        setPlayers(playersRes.data.filter(p => p.role !== 'admin') || [])

        if (categoriesRes.data.length > 0) {
          setSelectedCategory(categoriesRes.data[0])
          loadRankAssignments(categoriesRes.data[0].id)
        }
      } catch (err) {
        setError('Failed to fetch game data')
        console.error(err)
      }
    }

    fetchData()
  }, [gameId])

  const loadRankAssignments = async (categoryId) => {
    try {
      const response = await rankAssignmentAPI.getCategoryAssignments(categoryId)
      const assignments = {}
      response.data.forEach(assignment => {
        assignments[assignment.rank] = assignment.player_id
      })
      setRankAssignments(assignments)
    } catch (err) {
      console.error('Failed to load rank assignments:', err)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!categoryTitle.trim() || !categoryQuestion.trim()) {
        throw new Error('Title and question are required')
      }

      const answers = categoryAnswers
        .map((ans, idx) => ({ rank: idx + 1, answer_text: ans }))
        .filter(item => item.answer_text.trim())

      if (answers.length === 0) {
        throw new Error('At least one answer is required')
      }

      const response = await categoryAPI.createCategory(gameId, categoryTitle, categoryQuestion, answers, adminPassword)

      setCategories([...categories, response.data])
      setSelectedCategory(response.data)
      setShowNewCategoryForm(false)
      setCategoryTitle('')
      setCategoryQuestion('')
      setCategoryAnswers(Array(12).fill(''))
      await loadRankAssignments(response.data.id)
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRank = async (rank, playerId) => {
    if (!selectedCategory) return

    try {
      await rankAssignmentAPI.assignRank(selectedCategory.id, rank, playerId, adminPassword)
      setRankAssignments({
        ...rankAssignments,
        [rank]: playerId,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign rank')
    }
  }

  const handleRemoveRank = async (rank) => {
    if (!selectedCategory) return

    try {
      await rankAssignmentAPI.removeRankAssignment(selectedCategory.id, rank, adminPassword)
      const newAssignments = { ...rankAssignments }
      delete newAssignments[rank]
      setRankAssignments(newAssignments)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove rank')
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>ADMIN CONTROL ROOM</h1>
        <p className="game-id">Game: {gameId}</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="admin-grid">
        {/* Left: Categories List */}
        <div className="admin-section">
          <div className="card">
            <div className="card-title">Categories</div>
            <button
              className="btn btn-primary mb"
              onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
            >
              {showNewCategoryForm ? '✕ Cancel' : '+ New Category'}
            </button>

            <div className="categories-list">
              {categories.map((cat, index) => {
                const isActive = selectedCategory?.id === cat.id;
                return (
                <div
                  key={cat.id}
                  className={`category-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat)
                    loadRankAssignments(cat.id)
                  }}
                >
                  <div className="category-title">{isActive ? cat.title : `Category ${index + 1}`}</div>
                  {isActive && <div className="category-question">{cat.question}</div>}
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Right: Create/Edit Form or Rank Assignment */}
        <div className="admin-section">
          {showNewCategoryForm ? (
            <div className="card">
              <div className="card-title">Create Category</div>
              <form onSubmit={handleCreateCategory} className="grid gap-md">
                <div>
                  <label>Category Title</label>
                  <input
                    type="text"
                    value={categoryTitle}
                    onChange={(e) => setCategoryTitle(e.target.value)}
                    placeholder="e.g., Things at the Beach"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label>Question</label>
                  <textarea
                    value={categoryQuestion}
                    onChange={(e) => setCategoryQuestion(e.target.value)}
                    placeholder="e.g., Name something you bring to the beach"
                    rows="2"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label>Answers by Rank (1-12)</label>
                  <div className="answers-grid">
                    {categoryAnswers.map((ans, idx) => (
                      <div key={idx} className="answer-input-group">
                        <label>#{idx + 1}</label>
                        <input
                          type="text"
                          value={ans}
                          onChange={(e) => {
                            const newAnswers = [...categoryAnswers]
                            newAnswers[idx] = e.target.value
                            setCategoryAnswers(newAnswers)
                          }}
                          placeholder={`Rank ${idx + 1}${idx === 10 ? ' (-2)' : idx === 11 ? ' (-5)' : ''}`}
                          maxLength={100}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-gold" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Category'}
                </button>
              </form>
            </div>
          ) : selectedCategory ? (
            <div className="card">
              <div className="card-title">{selectedCategory.title}</div>
              <p className="category-question mb">{selectedCategory.question}</p>

              <div>
                <label className="section-label">Assign Teams to Ranks</label>
                <div className="ranks-grid">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((rank) => {
                    const answer = selectedCategory.answers?.find(a => a.rank === rank)
                    const assignedPlayerId = rankAssignments[rank]
                    const assignedPlayer = players.find(p => p.id === assignedPlayerId)

                    return (
                      <div key={rank} className="rank-assignment">
                        <div className="rank-number">#{rank}</div>
                        <div className="rank-answer" style={{letterSpacing: '3px', fontWeight: '900'}}>{answer?.answer_text ? 'XXXXX' : 'N/A'}</div>
                        <select
                          className="rank-select"
                          value={assignedPlayerId || ''}
                          onChange={(e) =>
                            e.target.value
                              ? handleAssignRank(rank, e.target.value)
                              : handleRemoveRank(rank)
                          }
                        >
                          <option value="">— Unassigned —</option>
                          {players.map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                        </select>
                        {assignedPlayer && (
                          <div className="rank-assigned" style={{ color: assignedPlayer.color }}>
                            ✓ {assignedPlayer.name}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center">
              <p>Select a category to assign teams to ranks</p>
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-secondary" onClick={onLogout} style={{ marginTop: '20px' }}>
        End Game
      </button>
    </div>
  )
}
