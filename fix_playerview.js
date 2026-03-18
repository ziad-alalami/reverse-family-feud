const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/PlayerView.jsx', 'utf8');

// 1. WebSocket onmessage update
const oldWsHandle = `      } else if (message.type === 'scores_update') {
        setAllTeams(message.scores || []);`;

const newWsHandle = `      } else if (message.type === 'scores_update') {
        setAllTeams(message.scores || []);
        const myScoreData = (message.scores || []).find(s => s.player_id === playerId);
        if (myScoreData) {
          setTotalScore(myScoreData.total_points);
          const newCatScores = {};
          (myScoreData.rank_assignments || []).forEach(a => {
            newCatScores[a.category_id] = (newCatScores[a.category_id] || 0) + a.points;
          });
          setCategoryScores(newCatScores);
        }`;

code = code.replace(oldWsHandle, newWsHandle);

// 2. Remove answer form completely.
const answerFormRegex = /<form onSubmit=\{handleSubmitAnswer\} className="answer-form">[\s\S]*?<\/form>/;
code = code.replace(answerFormRegex, `<div style={{textAlign: 'center', marginTop: '20px', fontSize: '18px', fontWeight: 'bold', color: '#ffed4e'}}>Waiting for Admin to reveal answers and assign points...</div>`);

// 3. Update categories map to use index
const oldCatMap = `{categories.map(category => (`;
const newCatMap = `{categories.map((category, index) => (`;
code = code.replace(oldCatMap, newCatMap);

const oldCatTitle = `<div className="category-title">{category.title}</div>`;
const newCatTitle = `<div className="category-title">{currentCategoryId === category.id ? category.title : \`Category \${index + 1}\`}</div>`;
code = code.replace(oldCatTitle, newCatTitle);

fs.writeFileSync('frontend/src/components/PlayerView.jsx', code);
