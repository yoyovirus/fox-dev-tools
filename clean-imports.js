const fs = require('fs');

function fixFile(f) {
    let content = fs.readFileSync(f, 'utf8');
    
    if (f.includes('json-to-table')) {
        let lines = content.split('\n');
        // Remove lines 0 to 5 which are duplicates
        lines.splice(0, 6);
        content = lines.join('\n');
    }
    
    // Move "use client"; to the absolute top of the file
    content = content.replace(/\"use client\";\r?\n?/g, '');
    content = '"use client";\n' + content;
    
    fs.writeFileSync(f, content);
}

fixFile('src/app/en/json-tools/json-to-table/page.tsx');
fixFile('src/app/en/base64-tools/base64-encoder-decoder/page.tsx');
console.log("Cleaned imports and use client");
