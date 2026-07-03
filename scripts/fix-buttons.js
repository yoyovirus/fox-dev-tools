const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/app/en');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;

walkDir(srcDir, function (filePath) {
    if (filePath.endsWith('page.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Button fixes
        
        // 1. Icon buttons: remove size="icon-sm" and use size="icon" className="size-8"
        content = content.replace(/size="icon-sm"/g, 'size="icon" className="size-8"');
        
        // 2. Clear buttons: ensure they have text-destructive correctly without messing up closing tags
        content = content.replace(/className="text-destructive hover:text-destructive hover:bg-destructive\/10 size-8/g, 'className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive');
        content = content.replace(/className="text-destructive hover:text-destructive hover:bg-destructive\/10 h-8 w-8/g, 'className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive');
        content = content.replace(/text-destructive hover:text-destructive hover:bg-destructive\/10/g, 'text-destructive hover:bg-destructive/10 hover:text-destructive');

        // 3. Sample buttons -> outline variant
        content = content.replace(/<Button onClick=\{loadSample\}/g, '<Button variant="outline" onClick={loadSample}');
        
        // 4. Minify button -> secondary variant
        content = content.replace(/<Button variant="outline" onClick=\{handleMinify\}/g, '<Button variant="secondary" onClick={handleMinify}');
        
        // 5. Swap button -> outline variant
        content = content.replace(/<Button onClick=\{swap\}/g, '<Button variant="outline" onClick={swap}');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            count++;
        }
    }
});

console.log("Fixed buttons in " + count + " files.");
