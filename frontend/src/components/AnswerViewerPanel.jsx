import { useState, useEffect } from 'react'
import { categoryAPI, rankAssignmentAPI, playerAPI } from '../api/client'
import './AnswerViewerPanel.css'

export default function AnswerViewerPanel({ gameId, playerId, adminPassword, onLogout, playerData }) {
  const [categories, setCategories] = useState([])
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [players, setPlayers] = useState([])
  const [rankAssignments, setRankAssignments] = useState({})
  const [error, setError] = useState('')

  // We'll borrow the layout and styling logic from AdminPanel/PlayerView
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/ws/${gameId}/${playerId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "player_joined" && message.player_role !== "admin") {
        setPlayers(prev => {
          const exists = prev.find(p => p.id === message.player_id);
          if (exists) return prev;
          return [...prev, { id: message.player_id, name: message.player_name, role: message.player_role, color: message.color }];
        });
      } else if (message.type === "active_category_update") {
        setCurrentCategoryId(message.category_id);
        loadRankAssignments(message.category_id);
        
        // Fetch categories again in case a new one was added
        categoryAPI.getCategoryList(gameId)
          .then(res => setCategories(res.data))
          .catch(err => console.error('Failed to update categories', err));
      } else if (message.type === "rank_assigned") {
        setCurrentCategoryId(prev => {
          loadRankAssignments(prev);
          return prev;
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
        setPlayers((playersRes.data || []).filter(p => p.role !== 'admin'))

        if (categoriesRes.data.length > 0) {
          setCurrentCategoryId(categoriesRes.data[0].id)
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

  const handleCategorySelect = (categoryId) => {
    setCurrentCategoryId(categoryId)
    loadRankAssignments(categoryId)
  }

  const currentCategory = categories.find(c => c.id === currentCategoryId)

  return (
    <div className="player-view answer-viewer-wrapper">
      <div className="player-header">
        <div className="player-info">
          <div className="game-id">Game ID: {gameId}</div>
          <div className="player-name" style={{ color: playerData?.color || '#004aad' }}>
            Answer Viewer (Spectator)
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => { if (window.confirm("Are you sure you want to leave the game?")) onLogout(); }}>
          Leave Game
        </button>
      </div>

      <div className="player-content top-sections viewer-layout">
        <div className="sidebar-section">
          <div className="team-scores-section" style={{ background: 'rgba(255,255,255,0.95)', border: '3px solid #ffed4e', padding: '20px', borderRadius: '16px', color: '#001a52', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '3px solid #ccc', paddingBottom: '10px', fontSize: '22px', fontWeight: '900', textTransform: 'uppercase' }}>Categories</h2>
            
            <div className="categories-list-viewer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((cat, index) => {
                const isActive = currentCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`category-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      background: isActive ? '#ffed4e' : 'rgba(255, 255, 255, 0.8)',
                      border: isActive ? '3px solid #ffed4e' : '3px solid transparent',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      boxShadow: isActive ? '0 6px 20px rgba(255, 237, 78, 0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
                      color: '#001a52'
                    }}
                  >
                    <div style={{ fontWeight: '900', fontSize: '16px', textTransform: 'uppercase' }}>{cat.title}</div>
                  </div>
                );
              })}
              {categories.length === 0 && <div style={{opacity:0.6, fontStyle:'italic', textAlign:'center', marginTop:'10px'}}>No categories yet.</div>}
            </div>
          </div>
        </div>

        <div className="categories-section answer-section" style={{ padding: '30px' }}>
          {currentCategory ? (
            <>
              <div className="category-question">
                <h3>{currentCategory.title}</h3>
                <p>{currentCategory.question}</p>
              </div>

              <div className="revealed-answers viewer-answers-grid">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((rank) => {
                  const answer = currentCategory.answers?.find(a => a.rank === rank);
                  const assignedPlayerId = rankAssignments[rank];
                  const assignedTeam = players.find(p => p.id === assignedPlayerId);

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
                        {assignedTeam && <span style={{ fontSize: '13px', fontWeight: '600', color: assignedTeam.color, marginTop: '4px' }}>✓ {assignedTeam.name}</span>}
                      </div>
                    </div>
                  ) : (
                    <div key={rank} style={{
                      background: '#f8f9fa',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      padding: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      opacity: 0.5
                    }}>
                       <div style={{ background: '#eee', color: '#999', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', fontSize: '20px', border: '2px solid #ccc' }}>
                        #{rank}
                      </div>
                      <div style={{ flex: 1, fontSize: '18px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>N/A</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{textAlign: 'center', marginTop: '20px', fontSize: '18px', fontWeight: 'bold', color: '#001a52'}}>
              Select a category to view answers.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
