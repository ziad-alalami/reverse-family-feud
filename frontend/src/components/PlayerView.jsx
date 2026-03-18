import { useState, useEffect } from 'react'
import { answerAPI, categoryAPI } from '../utils/api'
import './PlayerView.css'

export default function PlayerView({ gameId, playerId, onLogout, playerData }) {
  const [categories, setCategories] = useState([])
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [playerAnswer, setPlayerAnswer] = useState('')
  const [totalScore, setTotalScore] = useState(0)
  const [categoryScores, setCategoryScores] = useState({})
  const [allTeams, setAllTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ws, setWs] = useState(null)
  const [adminActiveCategory, setAdminActiveCategory] = useState(null)
  const [revealedCategories, setRevealedCategories] = useState({})

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/ws/${gameId}/${playerId}`;
    const websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      console.log('WebSocket connected');
      websocket.send(JSON.stringify({ type: 'get_scores' }));
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)

            if (message.type === 'active_category_update') {
        setAdminActiveCategory(message.category_id);
        setCurrentCategoryId(message.category_id);
      } else if (message.type === 'reveal_answers') {
        setRevealedCategories(prev => ({...prev, [message.category_id]: message.reveal}));
      } else if (message.type === 'score_update') {
        setTotalScore(message.total_score)
        if (message.category_score) {
          setCategoryScores({
            ...categoryScores,
            [message.category_score.category_id]: message.category_score.points,
          })
        }
      } else if (message.type === 'scores_update') {
        setAllTeams(message.scores || []);
        const myScoreData = (message.scores || []).find(s => s.player_id === playerId);
        if (myScoreData) {
          setTotalScore(myScoreData.total_points);
          const newCatScores = {};
          (myScoreData.rank_assignments || []).forEach(a => {
            newCatScores[a.category_id] = (newCatScores[a.category_id] || 0) + a.points;
          });
          setCategoryScores(newCatScores);
        }
      } else if (message.type === 'scores_update_request') {
        websocket.send(JSON.stringify({ type: 'get_scores' }));
      } else if (message.type === 'player_joined' && message.player_role === 'player') {
        setAllTeams(prev => {
          if (prev.find(p => p.player_id === message.player_id)) return prev;
          return [...prev, { player_id: message.player_id, player_name: message.player_name, color: message.color, total_points: 0 }];
        });
      } else if (message.type === 'rank_assigned') {
        websocket.send(JSON.stringify({ type: 'get_scores' })); // refresh all scores

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

        <button className="btn btn-secondary" onClick={() => { if (window.confirm("Are you sure you want to leave the game? You can rejoin later using the same game ID.")) onLogout(); }}>
          Leave Team
        </button>
      </div>

      <div className="player-content">
        <div className="top-sections">
          <div className="sidebar-section">
            <div className="total-score-section" style={{ marginBottom: '20px' }}>
              <div className="score-label">Total Score</div>
              <div className="score-value">{totalScore}</div>
            </div>

            <div className="team-scores-section" style={{ background: 'rgba(255,255,255,0.95)', border: '3px solid #ffed4e', padding: '20px', borderRadius: '16px', color: '#001a52', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '3px solid #ccc', paddingBottom: '10px', fontSize: '22px', fontWeight: '900', textTransform: 'uppercase' }}>Leaderboard</h2>
              <div className="teams-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allTeams.sort((a,b) => b.total_points - a.total_points).map(team => (
                  <div key={team.player_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: team.player_id === playerId ? '#eef2ff' : '#f8f9fa', borderRadius: '8px', borderLeft: `6px solid ${team.color || '#ccc'}`, border: team.player_id === playerId ? '2px solid #004aad' : '1px solid #ddd', fontWeight: '600', alignItems: 'center' }}>
                    <span>{team.player_name} {team.player_id === playerId ? '(You)' : ''}</span>
                    <span style={{ fontWeight: '900', fontSize: '18px', color: '#004aad' }}>{team.total_points}</span>
                  </div>
                ))}
                {allTeams.length === 0 && <div style={{opacity:0.6, fontStyle:'italic', textAlign:'center', marginTop:'10px'}}>Waiting for teams...</div>}
              </div>
            </div>
          </div>

        <div className="categories-section">
          <h2>Categories</h2>
          <div className="categories-list">
            {categories.map((category, index) => (
              <button
                key={category.id}
                className={`category-btn ${currentCategoryId === category.id ? 'active' : ''}`}
                style={{ cursor: 'default' }}
                disabled
              >
                <div className="category-title">{currentCategoryId === category.id ? category.title : `Category ${index + 1}`}</div>
                <div className="category-score">
                  {categoryScores[category.id] !== undefined ? categoryScores[category.id] : 0}
                </div>
              </button>
            ))}
          </div>
        </div>
        </div>

        {currentCategory && (
          <div className="answer-section">
            <div className="category-question">
              <h3>{currentCategory.title}</h3>
              <p>{currentCategory.question}</p>
            </div>

            
              {revealedCategories[currentCategoryId] ? (
                <div className="revealed-answers" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '30px' }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((rank) => {
                    const answer = currentCategory.answers?.find(a => a.rank === rank);
                    const isAssigned = allTeams.find(t => (t.rank_assignments || []).some(ra => ra.category_id === currentCategoryId && ra.points === (answer?.points || 0)));
                    // We need a better way to find who got it. Since we know rank_assignments have points, but we don't have rank in team score unless we broadcast it.
                    // Let's rely on total points or assume the backend scores are just what we have.
                    // For now, let's just show the answers cleanly!
                    const assignedTeam = allTeams.find(t => (t.rank_assignments || []).some(ra => ra.category_id === currentCategoryId && ra.rank === rank));
                    return answer ? (
                      <div key={rank} style={{ 
                        background: assignedTeam ? '#eef2ff' : '#f8f9fa', 
                        border: `2px solid ${assignedTeam?.color || '#004aad'}`, 
                        borderRadius: '8px', 
                        padding: '15px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ background: assignedTeam?.color || '#ffed4e', color: assignedTeam ? '#fff' : '#004aad', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', fontSize: '20px', border: `2px solid ${assignedTeam?.color || '#004aad'}` }}>
                          #{rank}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>{answer.answer_text}</span>
                          {assignedTeam && <span style={{ fontSize: '13px', fontWeight: '600', color: assignedTeam.color, marginTop: '4px' }}>✓ {assignedTeam.player_name}</span>}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div style={{textAlign: 'center', marginTop: '20px', fontSize: '18px', fontWeight: 'bold', color: '#001a52', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '2px dashed #ccc'}}>
                  {currentCategoryId === adminActiveCategory 
                    ? "Active Category! Waiting for Admin to reveal answers..." 
                    : "Waiting for Admin to reveal answers and assign points..."}
                </div>
              )}

          </div>
        )}
      </div>
    </div>
  )
}
