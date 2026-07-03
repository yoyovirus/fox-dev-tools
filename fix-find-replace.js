const fs = require('fs');
let f = 'src/app/en/text-tools/find-replace/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/ id \/>/g, ' />');

fs.writeFileSync(f, c);
console.log("Fixed id!");
