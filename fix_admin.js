const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/AdminPanel.jsx', 'utf8');

// 1. Add wsAPI import
code = code.replace(
    'import { categoryAPI, rankAssignmentAPI, playerAPI, gameAPI } from \'../api/client\'',
    'import { categoryAPI, rankAssignmentAPI, playerAPI, gameAPI, wsAPI } from \'../api/client\''
);

// 2. Add answer reveal state
code = code.replace(
    'const [error, setError] = useState(\'\')',
    'const [error, setError] = useState(\'\')\n  const [revealedCategories, setRevealedCategories] = useState({})'
);

// 3. Update category selection to broadcast
code = code.replace(
    'setSelectedCategory(cat)\n                    loadRankAssignments(cat.id)',
    'setSelectedCategory(cat)\n                    loadRankAssignments(cat.id)\n                    wsAPI.broadcastActiveCategory(gameId, cat.id).catch(console.error)'
);

// 4. Update the select handler in create category too just in case
code = code.replace(
    'setSelectedCategory(response.data)\n      setShowNewCategoryForm(false)',
    'setSelectedCategory(response.data)\n      setShowNewCategoryForm(false)\n      wsAPI.broadcastActiveCategory(gameId, response.data.id).catch(console.error)'
);

// 5. Add "Show Answers" button below the category question
const toggleRevealCode = `
  const toggleReveal = (categoryId) => {
    const nextState = !revealedCategories[categoryId];
    setRevealedCategories({...revealedCategories, [categoryId]: nextState});
    wsAPI.broadcastRevealAnswers(gameId, categoryId, nextState).catch(console.error);
  };
`;
code = code.replace('const handleCreateCategory = async', toggleRevealCode + '\n  const handleCreateCategory = async');

const oldQuestionDisplay = `<p className="category-question mb">{selectedCategory.question}</p>`;
const newQuestionDisplay = `<p className="category-question mb">{selectedCategory.question}</p>
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                <button 
                  className={revealedCategories[selectedCategory.id] ? "btn btn-secondary" : "btn btn-primary"}
                  onClick={() => toggleReveal(selectedCategory.id)}
                >
                  {revealedCategories[selectedCategory.id] ? "Hide Answers from Players" : "Reveal Answers to Players"}
                </button>
              </div>`;
code = code.replace(oldQuestionDisplay, newQuestionDisplay);

fs.writeFileSync('frontend/src/components/AdminPanel.jsx', code);
