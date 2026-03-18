const fs = require('fs');
let code = fs.readFileSync('backend/app/routes/websocket.py', 'utf8');

code = code.replace(
    '"rank_assignments": [{"category_id": a.category_id, "points": a.points} for a in score.rank_assignments]',
    '"rank_assignments": [{"category_id": a.category_id, "rank": a.rank, "points": a.points} for a in score.rank_assignments]'
);

fs.writeFileSync('backend/app/routes/websocket.py', code);
