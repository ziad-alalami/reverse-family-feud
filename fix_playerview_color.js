const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/PlayerView.jsx', 'utf8');

code = code.replace(
    '<div style={{textAlign: \'center\', marginTop: \'20px\', fontSize: \'18px\', fontWeight: \'bold\', color: \'#ffed4e\'}}>Waiting for Admin to reveal answers and assign points...</div>',
    '<div style={{textAlign: \'center\', marginTop: \'20px\', fontSize: \'18px\', fontWeight: \'bold\', color: \'#001a52\', padding: \'20px\', background: \'#f8f9fa\', borderRadius: \'12px\', border: \'2px dashed #ccc\'}}>Waiting for Admin to reveal answers and assign points...</div>'
);
fs.writeFileSync('frontend/src/components/PlayerView.jsx', code);
