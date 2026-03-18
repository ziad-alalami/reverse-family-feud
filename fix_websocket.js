const fs = require('fs');
let code = fs.readFileSync('backend/app/routes/websocket.py', 'utf8');

// Update get_scores to include rank_assignments
const oldScoresUpdate = `                        {
                            "player_id": score.player_id,
                            "player_name": score.player_name,
                            "color": score.color,
                            "total_points": score.total_points,
                        }
                        for score in scores`;

const newScoresUpdate = `                        {
                            "player_id": score.player_id,
                            "player_name": score.player_name,
                            "color": score.color,
                            "total_points": score.total_points,
                            "rank_assignments": [{"category_id": a.category_id, "points": a.points} for a in score.rank_assignments]
                        }
                        for score in scores`;

code = code.replace(oldScoresUpdate, newScoresUpdate);
fs.writeFileSync('backend/app/routes/websocket.py', code);
