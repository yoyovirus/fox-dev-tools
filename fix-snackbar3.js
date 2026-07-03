const fs = require('fs');
let f = 'src/app/en/base64-tools/base64-encoder-decoder/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/<Snackbar[\s\S]*?\/>/g, '');

fs.writeFileSync(f, c);
console.log("Fixed snackbar for real!");
