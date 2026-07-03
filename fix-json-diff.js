const fs = require('fs');
let f = 'src/app/en/json-tools/json-diff/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/\{\/\* Error Messages \*\/\}/g, '');
c = c.replace(/\{\(origError \|\| modError\) && \(/g, '{Boolean(origError || modError) && (');
c = c.replace(/\{origError && \(/g, '{Boolean(origError) && (');
c = c.replace(/\{modError && \(/g, '{Boolean(modError) && (');
c = c.replace(/\{\(original \|\| modified\) && \(/g, '{Boolean(original || modified) && (');
c = c.replace(/\{original && \(/g, '{Boolean(original) && (');
c = c.replace(/\{modified && \(/g, '{Boolean(modified) && (');
c = c.replace(/\{parsedData && \(/g, '{Boolean(parsedData) && (');

fs.writeFileSync(f, c);
console.log("Fixed json diff!");
