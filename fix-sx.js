const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/en/**/*.tsx');
files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let original = c;
    c = c.replace(/\s+sx=\{\{[^}]+\}\}/g, '');
    if (c !== original) {
        fs.writeFileSync(f, c);
        console.log("Fixed sx in", f);
    }
});
