const fs = require('fs');
let code = fs.readFileSync('backend/app/routes/categories.py', 'utf8');

code = code.replace(
    '    return {"category_id": category_id, "rank": rank, "removed": True}',
    '    await broadcast_scores_update(category.game_id)\n    return {"category_id": category_id, "rank": rank, "removed": True}'
);

fs.writeFileSync('backend/app/routes/categories.py', code);
