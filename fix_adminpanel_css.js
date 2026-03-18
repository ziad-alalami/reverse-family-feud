const fs = require('fs');
let css = fs.readFileSync('frontend/src/components/AdminPanel.css', 'utf8');

// Update admin-grid layout
const oldGrid = `.admin-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}`;

const newGrid = `.admin-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}`;

css = css.replace(oldGrid, newGrid);

// Update active and non-active category item colors to match Family Feud theme
const oldCategoryItem = `.category-item {
  background: #f8f9fa;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.category-item:hover {
  border-color: #004aad;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.category-item.active {
  border-color: #004aad;
  background: #004aad;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 74, 173, 0.4);
}

.category-item.active .category-title {
  color: #ffed4e;
}

.category-item.active .category-question {
  color: #fff;
}`;

const newCategoryItem = `.category-item {
  background: rgba(255, 255, 255, 0.8);
  border: 3px solid transparent;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.2);
  border-color: #ffed4e;
}

.category-item.active {
  border-color: #ffed4e;
  background: #ffed4e;
  color: #001a52;
  box-shadow: 0 6px 20px rgba(255, 237, 78, 0.4);
}

.category-item.active .category-title {
  color: #001a52;
}

.category-item.active .category-question {
  color: #333;
}`;

css = css.replace(oldCategoryItem, newCategoryItem);

fs.writeFileSync('frontend/src/components/AdminPanel.css', css);
