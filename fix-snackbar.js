const fs = require('fs');
let f = 'src/app/en/json-tools/json-relationship-visualizer/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/<Snackbar[\s\S]*?\/>/g, '');

fs.writeFileSync(f, c);
console.log("Fixed Snackbar!");
