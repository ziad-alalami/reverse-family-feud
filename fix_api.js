const fs = require('fs');
let code = fs.readFileSync('frontend/src/api/client.js', 'utf8');

if (!code.includes('broadcastActiveCategory')) {
    code += `
export const wsAPI = {
  broadcastActiveCategory: (gameId, categoryId) => axios.post(\`\${API_BASE}/ws/broadcast/\${gameId}/active-category?category_id=\${categoryId}\`),
  broadcastRevealAnswers: (gameId, categoryId, reveal) => axios.post(\`\${API_BASE}/ws/broadcast/\${gameId}/reveal-answers?category_id=\${categoryId}&reveal=\${reveal}\`)
};
`;
    fs.writeFileSync('frontend/src/api/client.js', code);
}
