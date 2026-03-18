import { useState, useEffect } from 'react'
import { answerAPI, categoryAPI } from '../utils/api'
import './PlayerView.css'

export default function PlayerView({ gameId, playerId, onLogout, playerData }) {
  const [categories, setCategories] = useState([])
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [playerAnswer, setPlayerAnswer] = useState('')
  const [totalScore, setTotalScore] = useState(0)
  const [categoryScores, setCategoryScores] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ws, setWs] = useState(null)

  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/api/ws/ws/${gameId}/${playerId}`
    const websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      console.log('WebSocket connected')
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === 'score_update') {
        setTotalScore(message.total_score)
        if (message.category_score) {
          setCategoryScores({
            ...categoryScores,
            [message.category_score.category_id]: message.category_score.points,
          })
        }
      } else if (message.type === 'rank_assigned') {
        if (message.player_id === playerId) {
          // Update local score
          answerAPI.getPlayerScore(playerId).then(res => {
            setTotalScore(res.data.total_score)
          })
        }
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [gameId, playerId])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getGameCategories(gameId)
        setCategories(response.data)
        if (response.data.length > 0) {
          setCurrentCategoryId(response.data[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }

    fetchCategories()
  }, [gameId])

  // Fetch initial scores
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await answerAPI.getPlayerScore(playerId)
        setTotalScore(response.data.total_score)
      } catch (err) {
        console.error('Failed to fetch score:', err)
      }
    }

    fetchScores()
  }, [playerId])

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await answerAPI.submitAnswer({
        player_id: playerId,
        category_id: currentCategoryId,
        answer_text: playerAnswer,
      })

      setPlayerAnswer('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      console.error('Failed to submit answer:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = categories.find(c => c.id === currentCategoryId)

  return (
    <div className="player-view">
      <div className="player-header">
        <div className="player-info">
          <div className="game-id">Game ID: {gameId}</div>
          <div className="player-name" style={{ color: playerData?.color }}>
            {playerData?.name}
          </div>
          {playerData?.team_members && (
            <div className="team-members">
              {playerData.team_members.map((member, idx) => (
                <span key={idx} className="team-member">{member}</span>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-secondary" onClick={onLogout}>
          Leave Game
        </button>
      </div>

      <div className="player-content">
        <div className="total-score-section">
          <div className="score-label">Total Score</div>
          <div className="score-value">{totalScore}</div>
        </div>

        <div className="categories-section">
          <h2>Categories</h2>
          <div className="categories-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${currentCategoryId === category.id ? 'active' : ''}`}
                onClick={() => setCurrentCategoryId(category.id)}
              >
                <div className="category-title">{category.title}</div>
                <div className="category-score">
                  {categoryScores[category.id] !== undefined ? categoryScores[category.id] : 0}
                </div>
              </button>
            ))}
          </div>
        </div>

        {currentCategory && (
          <div className="answer-section">
            <div className="category-question">
              <h3>{currentCategory.title}</h3>
              <p>{currentCategory.question}</p>
            </div>

            <form onSubmit={handleSubmitAnswer} className="answer-form">
              <textarea
                value={playerAnswer}
                onChange={(e) => setPlayerAnswer(e.target.value)}
                placeholder="Enter your answer..."
                disabled={submitted}
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !playerAnswer.trim() || submitted}
              >
                {submitted ? '✓ Submitted' : loading ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
