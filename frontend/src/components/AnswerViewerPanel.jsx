import { useState, useEffect } from 'react'
import { categoryAPI, answerAPI, playerAPI } from '../utils/api'
import './AnswerViewerPanel.css'

export default function AnswerViewerPanel({ gameId, playerId, onLogout, playerData }) {
  const [categories, setCategories] = useState([])
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [players, setPlayers] = useState([])
  const [categoryAnswers, setCategoryAnswers] = useState([])
  const [error, setError] = useState('')

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, playersRes] = await Promise.all([
          categoryAPI.getGameCategories(gameId),
          playerAPI.getGamePlayers(gameId),
        ])

        setCategories(categoriesRes.data)
        setPlayers(playersRes.data.filter(p => p.role === 'player'))

        if (categoriesRes.data.length > 0) {
          setCurrentCategoryId(categoriesRes.data[0].id)
        }
      } catch (err) {
        setError('Failed to fetch game data')
        console.error(err)
      }
    }

    fetchData()
  }, [gameId])

  // Fetch category answers when category changes
  useEffect(() => {
    if (currentCategoryId) {
      const fetchAnswers = async () => {
        try {
          const response = await answerAPI.getCategoryAnswers(currentCategoryId)
          setCategoryAnswers(response.data)
        } catch (err) {
          console.error('Failed to fetch answers:', err)
        }
      }

      fetchAnswers()
    }
  }, [currentCategoryId])

  const currentCategory = categories.find(c => c.id === currentCategoryId)
  const unrankedAnswers = categoryAnswers.filter(a => a.assigned_rank === null)
  const rankedAnswers = categoryAnswers.filter(a => a.assigned_rank !== null)

  return (
    <div className="answer-viewer-panel">
      <div className="viewer-header">
        <div className="viewer-title">
          <h1>Answer Viewer</h1>
          <div className="game-id">Game ID: {gameId}</div>
          <div className="read-only-badge">Read-Only Mode</div>
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>
          Leave
        </button>
      </div>

      <div className="viewer-content">
        <div className="sidebar">
          <div className="sidebar-title">Categories</div>
          <div className="categories-list">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-item ${currentCategoryId === cat.id ? 'active' : ''}`}
                onClick={() => setCurrentCategoryId(cat.id)}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="main-content">
          {error && <div className="error-message">{error}</div>}

          {currentCategory ? (
            <div className="category-view">
              <div className="category-header">
                <div>
                  <h2>{currentCategory.title}</h2>
                  <p className="category-question">{currentCategory.question}</p>
                </div>
              </div>

              <div className="answers-display">
                <div className="answers-section-container">
                  <h3>Unranked Submissions ({unrankedAnswers.length})</h3>
                  {unrankedAnswers.length === 0 ? (
                    <p className="no-answers">No unranked submissions</p>
                  ) : (
                    <div className="answers-grid">
                      {unrankedAnswers.map(answer => {
                        const player = players.find(p => p.id === answer.player_id)
                        return (
                          <div key={answer.id} className="answer-card">
                            <div className="answer-player" style={{ color: player?.color }}>
                              {player?.name}
                            </div>
                            <div className="answer-text">{answer.answer_text}</div>
                            <div className="submission-info">
                              <span className="unranked-badge">Not Ranked</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {rankedAnswers.length > 0 && (
                  <div className="answers-section-container">
                    <h3>Ranked Answers ({rankedAnswers.length})</h3>
                    <div className="ranked-grid">
                      {rankedAnswers.map(answer => {
                        const player = players.find(p => p.id === answer.player_id)
                        return (
                          <div key={answer.id} className="ranked-item">
                            <div className="ranked-rank">Rank {answer.assigned_rank}</div>
                            <div className="ranked-player" style={{ color: player?.color }}>
                              {player?.name}
                            </div>
                            <div className="ranked-answer">{answer.answer_text}</div>
                            <div className="ranked-points">{answer.points} pts</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-category">
              <p>No categories available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
