const fs = require('fs');
let f = 'src/app/en/json-tools/json-relationship-visualizer/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/alpha\(color, 0\.4\)/g, 'color');
c = c.replace(/alpha\(color, 0\.2\)/g, 'color');
c = c.replace(/alpha\([^,]+,\s*[0-9.]+\)/g, '"currentColor"');

fs.writeFileSync(f, c);
console.log("Fixed visualizer alpha!");
