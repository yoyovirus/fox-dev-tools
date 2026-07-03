const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/en/**/*.tsx');
files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let original = c;
    c = c.replace(/size="sm"([^>]*?)size="sm"/g, 'size="sm"$1');
    c = c.replace(/variant="outline"([^>]*?)variant="outline"/g, 'variant="outline"$1');
    if (c !== original) {
        fs.writeFileSync(f, c);
        console.log("Fixed duplicates in", f);
    }
});
