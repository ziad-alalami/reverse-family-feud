const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/AdminPanel.jsx', 'utf8');

// The crash happens because playersRes.data can be undefined if players API isn't correctly returning it,
// OR if playerAPI.getGamePlayers?.(gameId) isn't correctly awaited if it doesn't return data.
// Let's modify the try-catch block to be safer:
code = code.replace(
    'setPlayers(playersRes.data.filter(p => p.role !== \'admin\') || [])',
    'setPlayers((playersRes.data || []).filter(p => p.role !== \'admin\'))'
);

fs.writeFileSync('frontend/src/components/AdminPanel.jsx', code);
