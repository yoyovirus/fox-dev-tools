const fs = require('fs');
let f = 'src/app/en/json-tools/json-relationship-visualizer/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/const isDark = theme\.palette\.mode === "dark";/, 'const isDark = false; // TODO: properly use next-themes if needed');

fs.writeFileSync(f, c);
console.log("Fixed visualizer!");
