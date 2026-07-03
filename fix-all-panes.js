const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir("src/app/en", function (filePath) {
    if (filePath.endsWith("page.tsx")) {
        let content = fs.readFileSync(filePath, "utf8");
        let originalContent = content;

        // Pattern 1: <div className="flex-1"> followed by <div className="flex-1 min-w-[..."
        // with optional comments in between
        let regex1 = /<div className="flex-1">(\s*(?:\{\/\*[\s\S]*?\*\/}\s*)*)<div className="(flex-1 min-w-\[\d+px\][^"]*)"/g;
        content = content.replace(regex1, '<div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">$1<div className="$2"');
        
        // Pattern 2: Sometimes it's <div className="flex-1 overflow-auto"> ?
        let regex2 = /<div className="flex-1 overflow-auto">(\s*(?:\{\/\*[\s\S]*?\*\/}\s*)*)<div className="(flex-1 min-w-\[\d+px\][^"]*)"/g;
        content = content.replace(regex2, '<div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0 overflow-auto">$1<div className="$2"');

        // Pattern 3: Some might have <div className="flex-[35]...">
        let regex3 = /<div className="flex-1">(\s*(?:\{\/\*[\s\S]*?\*\/}\s*)*)<div className="(flex-\[\d+\] min-w-\[\d+px\][^"]*)"/g;
        content = content.replace(regex3, '<div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">$1<div className="$2"');

        // Note: For text-diff which doesn't have a comment maybe? The regex \s* handles that.
        // Let's also check if there is an inner div for the children that needs h-full.
        // Actually, the above just changing the parent flex direction to row on medium screens is enough to fix the split panes!

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, "utf8");
            console.log("Fixed panes in " + filePath);
        }
    }
});
