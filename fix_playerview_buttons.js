const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/PlayerView.jsx', 'utf8');

const oldButton = `<button
                key={category.id}
                className={\`category-btn \${currentCategoryId === category.id ? 'active' : ''}\`}
                onClick={() => setCurrentCategoryId(category.id)}
              >`;

const newButton = `<button
                key={category.id}
                className={\`category-btn \${currentCategoryId === category.id ? 'active' : ''}\`}
                style={{ cursor: 'default' }}
                disabled
              >`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('frontend/src/components/PlayerView.jsx', code);
