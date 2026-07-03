const fs = require('fs');
let f = 'src/app/en/json-tools/json-to-table/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/\{parsedData && \(\s*<Badge/g, '<div className="flex-1" />\n                {parsedData && (\n                    <Badge');
c = c.replace(/variant="ghost" size="icon" className="size-8 rounded-md hover:bg-muted\/50"/g, 'className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center"');
c = c.replace(/variant="ghost" size="icon" className="size-8 rounded-md hover:bg-destructive\/10 hover:text-destructive"/g, 'className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center hover:bg-destructive/10 hover:text-destructive"');

// Add text to the buttons so they don't look weird as wide white boxes with only an icon
c = c.replace(/<Download className="size-4 text-muted-foreground" \/>\s*<\/Button>/g, '<Download className="size-3.5" /> Export CSV\n                            </Button>');
c = c.replace(/<Copy className="size-4 text-muted-foreground" \/>\s*<\/Button>/g, '<Copy className="size-3.5" /> Copy MD\n                            </Button>');
c = c.replace(/<Trash2 className="size-4" \/>\s*<\/Button>/g, '<Trash2 className="size-3.5" /> Clear\n                            </Button>');

fs.writeFileSync(f, c);
console.log("Fixed layout!");
