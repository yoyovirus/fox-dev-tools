const fs = require('fs');
let f = 'src/app/en/json-tools/json-to-table/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// Fix use client
c = c.replace(/"use client";\n?/g, '');
c = '"use client";\n' + c;

// Remove MUI imports if any
c = c.replace(/import\s+\{[^}]*\}\s+from\s+"@mui\/material";\n?/g, '');
c = c.replace(/import\s+\{[^}]*\}\s+from\s+"@mui\/icons-material";\n?/g, '');

// Run the fix-toolbars logic specifically for json-to-table to make the buttons white
const WHITE_BUTTON_CLASS = 'className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center"';
c = c.replace(/<Button\s+variant="outline"\s+size="sm"\s+onClick=\{\(\)\s*=>\s*setInput\(SAMPLE_JSON_TO_TABLE\)\}>[\s\S]*?Sample[\s\S]*?<\/Button>/g, `<Button ${WHITE_BUTTON_CLASS} onClick={() => setInput(SAMPLE_JSON_TO_TABLE)}>\n<FileText className="size-3.5" />\nSample\n</Button>`);

c = c.replace(/import { FileText, Trash2, Search } from "lucide-react";/g, 'import { FileText, Trash2, Search, Download, Copy, X as ClearIcon } from "lucide-react";');

fs.writeFileSync(f, c);
