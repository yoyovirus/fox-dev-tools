const fs = require('fs');
let f = 'src/app/en/json-tools/json-diff/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/\{Boolean\(original \|\| modified\) && \(/g, '{!!(original || modified) && (');
c = c.replace(/\{Boolean\(modified\) && \(/g, '{!!(modified) && (');

fs.writeFileSync(f, c);
console.log("Fixed booleans!");
