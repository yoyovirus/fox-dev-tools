const fs = require('fs');
let f = 'src/app/en/base64-tools/image-to-base64/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/value=\{getRawBase64\(\)\}\s*id\s*\/>/g, 'value={getRawBase64()} readOnly />');
c = c.replace(/\s+id\s*\/>/g, ' readOnly />');

fs.writeFileSync(f, c);
console.log("Fixed input 2!");
