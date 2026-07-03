const fs = require('fs');
let f = 'src/app/en/json-tools/json-formatter/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/<div className="flex flex-col">[\s\S]*?<\/Select>\s*<\/div>/, `<select className="bg-white text-black dark:bg-white dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 border border-border shadow-sm h-8 px-3 text-xs rounded-md font-medium outline-none cursor-pointer" value={indent} onChange={(e) => setIndent(Number(e.target.value))}><option value={2}>2 Spaces</option><option value={4}>4 Spaces</option><option value={8}>8 Spaces</option></select>`);

fs.writeFileSync(f, c);
console.log("Fixed dropdown!");
