const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/PlayerView.jsx', 'utf8');

const oldStructure = `<div className="total-score-section">
          <div className="score-label">Total Score</div>
          <div className="score-value">{totalScore}</div>
        </div>

        <div className="team-scores-section" style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Leaderboard</h2>
          <div className="teams-list" style={{ display: 'grid', gap: '10px' }}>
            {allTeams.sort((a,b) => b.total_points - a.total_points).map(team => (
              <div key={team.player_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: team.player_id === playerId ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: \`4px solid \${team.color || '#fff'}\` }}>
                <span style={{ fontWeight: 'bold' }}>{team.player_name} {team.player_id === playerId ? '(You)' : ''}</span>
                <span style={{ fontWeight: '900', color: team.color }}>{team.total_points}</span>
              </div>
            ))}
            {allTeams.length === 0 && <div style={{opacity:0.5}}>No teams yet.</div>}
          </div>
        </div>

        <div className="categories-section">`;

const newStructure = `<div className="top-sections">
          <div className="sidebar-section">
            <div className="total-score-section" style={{ marginBottom: '20px' }}>
              <div className="score-label">Total Score</div>
              <div className="score-value">{totalScore}</div>
            </div>

            <div className="team-scores-section" style={{ background: 'rgba(255,255,255,0.95)', border: '3px solid #ffed4e', padding: '20px', borderRadius: '16px', color: '#001a52', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '3px solid #ccc', paddingBottom: '10px', fontSize: '22px', fontWeight: '900', textTransform: 'uppercase' }}>Leaderboard</h2>
              <div className="teams-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allTeams.sort((a,b) => b.total_points - a.total_points).map(team => (
                  <div key={team.player_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: team.player_id === playerId ? '#eef2ff' : '#f8f9fa', borderRadius: '8px', borderLeft: \`6px solid \${team.color || '#ccc'}\`, border: team.player_id === playerId ? '2px solid #004aad' : '1px solid #ddd', fontWeight: '600', alignItems: 'center' }}>
                    <span>{team.player_name} {team.player_id === playerId ? '(You)' : ''}</span>
                    <span style={{ fontWeight: '900', fontSize: '18px', color: '#004aad' }}>{team.total_points}</span>
                  </div>
                ))}
                {allTeams.length === 0 && <div style={{opacity:0.6, fontStyle:'italic', textAlign:'center', marginTop:'10px'}}>Waiting for teams...</div>}
              </div>
            </div>
          </div>

        <div className="categories-section">`;

code = code.replace(oldStructure, newStructure);

// find closing tag for top-sections
code = code.replace(/<\/div>\n\n        {currentCategory && \(/, "</div>\n        </div>\n\n        {currentCategory && (");

fs.writeFileSync('frontend/src/components/PlayerView.jsx', code);
