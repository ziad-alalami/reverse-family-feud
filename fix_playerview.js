const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/PlayerView.jsx', 'utf8');

const oldAnswerBlock = `return answer ? (
                      <div key={rank} style={{ 
                        background: '#f8f9fa', 
                        border: '2px solid #004aad', 
                        borderRadius: '8px', 
                        padding: '15px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ background: '#ffed4e', color: '#004aad', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', fontSize: '20px', border: '2px solid #004aad' }}>
                          #{rank}
                        </div>
                        <div style={{ flex: 1, fontSize: '18px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                          {answer.answer_text}
                        </div>
                      </div>
                    ) : null;`;

const newAnswerBlock = `const assignedTeam = allTeams.find(t => (t.rank_assignments || []).some(ra => ra.category_id === currentCategoryId && ra.rank === rank));
                    return answer ? (
                      <div key={rank} style={{ 
                        background: assignedTeam ? '#eef2ff' : '#f8f9fa', 
                        border: \`2px solid \${assignedTeam?.color || '#004aad'}\`, 
                        borderRadius: '8px', 
                        padding: '15px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ background: assignedTeam?.color || '#ffed4e', color: assignedTeam ? '#fff' : '#004aad', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', fontSize: '20px', border: \`2px solid \${assignedTeam?.color || '#004aad'}\` }}>
                          #{rank}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>{answer.answer_text}</span>
                          {assignedTeam && <span style={{ fontSize: '13px', fontWeight: '600', color: assignedTeam.color, marginTop: '4px' }}>✓ {assignedTeam.player_name}</span>}
                        </div>
                      </div>
                    ) : null;`;

code = code.replace(oldAnswerBlock, newAnswerBlock);
fs.writeFileSync('frontend/src/components/PlayerView.jsx', code);
