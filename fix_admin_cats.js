const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/AdminPanel.jsx', 'utf8');

const oldCatList = `<div className="category-title">{isActive ? cat.title : \`Category \${index + 1}\`}</div>
                  {isActive && <div className="category-question">{cat.question}</div>}`;
const newCatList = `<div className="category-title" style={{ margin: 0 }}>{isActive ? cat.title : \`Category \${index + 1}\`}</div>`;

code = code.replace(oldCatList, newCatList);

const oldAnswer = `<div className="rank-answer" style={{letterSpacing: '3px', fontWeight: '900'}}>{answer?.answer_text ? 'XXXXX' : 'N/A'}</div>`;
const newAnswer = `<div className="rank-answer" style={{letterSpacing: revealedCategories[selectedCategory.id] ? '0px' : '3px', fontWeight: '900'}}>{answer?.answer_text ? (revealedCategories[selectedCategory.id] ? answer.answer_text : 'XXXXX') : 'N/A'}</div>`;

code = code.replace(oldAnswer, newAnswer);

fs.writeFileSync('frontend/src/components/AdminPanel.jsx', code);
