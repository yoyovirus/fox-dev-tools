const fs = require('fs');
let f = 'src/app/en/base64-tools/base64-encoder-decoder/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/<Button variant="outline" size="sm" onClick=\{handleDownload\}>\}[\s\S]*?<\/Button>/, '<Button className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" onClick={handleDownload}><Download className="size-3.5" /> Download {detectedFile?.extension?.toUpperCase() || "Image"}</Button>');

c = c.replace(/<Button\s+variant="contained"\s+startIcon=\{<Download className="size-4" \/>\}\s+onClick=\{handleDownload\}\s+sx=\{[\s\S]*?\}\s*>/, '<Button className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" onClick={handleDownload}>');

fs.writeFileSync(f, c);
console.log("Fixed base64 buttons!");
