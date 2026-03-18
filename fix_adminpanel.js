const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/AdminPanel.jsx', 'utf8');

// 1. Hide answers
const oldAnswerDisplay = `<div className="rank-answer">{answer?.answer_text || 'N/A'}</div>`;
const newAnswerDisplay = `<div className="rank-answer" style={{letterSpacing: '3px', fontWeight: '900'}}>{answer?.answer_text ? 'XXXXX' : 'N/A'}</div>`;
code = code.replace(oldAnswerDisplay, newAnswerDisplay);

// 2. Hide category titles in the list until active
const oldCatMap = `{categories.map((cat) => (`;
const newCatMap = `{categories.map((cat, index) => {
                const isActive = selectedCategory?.id === cat.id;
                return (`;

code = code.replace(oldCatMap, newCatMap);

const oldCatContent = `<div
                  key={cat.id}
                  className={\`category-item \${selectedCategory?.id === cat.id ? 'active' : ''}\`}
                  onClick={() => {
                    setSelectedCategory(cat)
                    loadRankAssignments(cat.id)
                  }}
                >
                  <div className="category-title">{cat.title}</div>
                  <div className="category-question">{cat.question}</div>
                </div>
              ))}
            </div>`;

const newCatContent = `<div
                  key={cat.id}
                  className={\`category-item \${isActive ? 'active' : ''}\`}
                  onClick={() => {
                    setSelectedCategory(cat)
                    loadRankAssignments(cat.id)
                  }}
                >
                  <div className="category-title">{isActive ? cat.title : \`Category \${index + 1}\`}</div>
                  {isActive && <div className="category-question">{cat.question}</div>}
                </div>
              );
            })}
            </div>`;

code = code.replace(oldCatContent, newCatContent);

fs.writeFileSync('frontend/src/components/AdminPanel.jsx', code);
