const fs = require('fs');

const file1 = 'src/app/en/json-tools/json-relationship-visualizer/page.tsx';
let content = fs.readFileSync(file1, 'utf8');

// Replace icons
content = content.replace(/<TreeIcon[^>]*\/>/g, '<Network className="size-4" />');
content = content.replace(/<TableIcon[^>]*\/>/g, '<Table className="size-4" />');
content = content.replace(/<FitScreenIcon[^>]*\/>/g, '<Maximize className="size-4" />');
content = content.replace(/<ZoomInIcon[^>]*\/>/g, '<ZoomIn className="size-4" />');
content = content.replace(/<ZoomOutIcon[^>]*\/>/g, '<ZoomOut className="size-4" />');

// Replace missing lucide imports
if (!content.includes("Network")) {
    content = content.replace(/from "lucide-react";/, 'Network, Table, Maximize, ZoomIn, ZoomOut, from "lucide-react";');
}

// Fix setFormat -> setView
content = content.replace(/onClick=\{\(\) => setFormat\('graph'\)\}/g, "onClick={() => setView('graph')}");
content = content.replace(/onClick=\{\(\) => setFormat\('summary'\)\}/g, "onClick={() => setView('summary')}");

fs.writeFileSync(file1, content);

console.log("Fixed icons in json-relationship-visualizer");
