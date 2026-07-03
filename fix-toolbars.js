const fs = require('fs');
const path = require('path');

const WHITE_BUTTON_CLASS = 'className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center"';

const ICON_MAP = {
    'Sample': 'FileText',
    'Load Sample': 'FileText',
    'Load Sample Image': 'FileText',
    'Format': 'Wand2',
    'Minify': 'Minimize',
    'Validate': 'CheckCircle2',
    'Compare': 'ArrowRightLeft',
    'Swap': 'ArrowRightLeft',
    'Clear': 'Trash2',
    'Encode': 'Lock',
    'Decode': 'Unlock',
    'Generate': 'RefreshCw',
    'Convert': 'RefreshCw',
    'Remove': 'Trash2',
    'Search': 'Search',
    'Replace': 'Replace',
};

// Map of components that need to be imported from lucide-react if we add an icon
const NEEDED_ICONS = new Set(Object.values(ICON_MAP));

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (filePath.endsWith('page.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const files = getAllFiles('src/app/en');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Move Sample button to the left of <div className="flex-1" />
    // This is tricky using regex, we can do it by finding <div className="flex-1" /> and ensuring all primary buttons are before it.
    // However, since Sample is usually the only one on the right that needs moving, let's just find the Sample button and flex-1.
    
    // Instead of regex for moving, we can standardize the toolbar if it has flex-1
    // Actually, a safer way to move Sample button is to just look for it and move it before flex-1.
    // Let's do a simple replace: if we see `<div className="flex-1" />` followed by `Sample` button (maybe with some whitespace or Tooltips), we swap them.
    // It's easier to find the Sample button string, remove it, and insert it before `<div className="flex-1" />`.
    
    const sampleBtnRegex = /<Button[^>]*onClick=\{[^}]*(?:loadSample|handleLoadSample|SAMPLE|processSample)[^}]*\}[^>]*>[\s\S]*?(?:Sample|Load Sample Image)[\s\S]*?<\/Button>/;
    const match = content.match(sampleBtnRegex);
    
    if (match) {
        const sampleBtnStr = match[0];
        
        // Check if flex-1 exists
        if (content.includes('<div className="flex-1" />')) {
            const flexIndex = content.indexOf('<div className="flex-1" />');
            const sampleIndex = content.indexOf(sampleBtnStr);
            
            // If sample is AFTER flex-1, move it
            if (sampleIndex > flexIndex) {
                // Remove sample btn from its current position
                content = content.replace(sampleBtnStr, '');
                
                // Insert it before flex-1
                content = content.replace('<div className="flex-1" />', sampleBtnStr + '\n<div className="flex-1" />');
                changed = true;
            }
        }
    }

    // 2. Make all named buttons white and add icons
    // We'll look for `<Button variant="outline" ...> Text </Button>`
    // Also catch `variant="default"` or no variant if they are primary actions.
    const buttonRegex = /<Button([^>]*)>([\s\S]*?)<\/Button>/g;
    
    content = content.replace(buttonRegex, (match, props, inner) => {
        // Skip icon-only buttons (they usually have size="icon")
        if (props.includes('size="icon"') || props.includes('size={"icon"}')) return match;
        
        // Skip if already has our exact class to avoid double-processing
        
        // Extract inner text to determine which icon to use
        // Clean inner text of any existing icons/spans
        const innerTextMatch = inner.match(/([A-Za-z]+(?:\s[A-Za-z]+)*)/);
        if (!innerTextMatch) return match;
        
        const text = innerTextMatch[1].trim();
        const iconName = ICON_MAP[text];
        
        // If it's a known primary button (or just any named button)
        if (iconName || ['Format', 'Minify', 'Validate', 'Compare', 'Swap', 'Generate', 'Convert', 'Sample', 'Load Sample', 'Load Sample Image'].includes(text)) {
            
            // Remove variant="outline" or variant="default"
            let newProps = props.replace(/variant=(?:"outline"|"default"|'outline'|'default'|\{"outline"\}|\{"default"\})/g, '');
            // Remove className="..."
            newProps = newProps.replace(/className=(?:"[^"]*"|'[^']*'|\{[^}]*\})/g, '');
            
            // Reconstruct button with new class and icon
            let newInner = text;
            if (iconName) {
                // Check if icon is already there
                if (!inner.includes(iconName)) {
                    newInner = `<${iconName} className="size-3.5" />\n${text}`;
                } else {
                    newInner = inner; // keep existing inner if it already has the icon
                }
            } else {
                newInner = inner; // Fallback
            }
            
            return `<Button ${WHITE_BUTTON_CLASS} ${newProps}>\n${newInner}\n</Button>`;
        }
        
        return match;
    });

    // 3. Ensure required icons are imported from lucide-react
    let lucideImports = new Set();
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/g;
    let importMatch;
    let importStatement = '';
    
    while ((importMatch = importRegex.exec(content)) !== null) {
        importStatement = importMatch[0];
        const imports = importMatch[1].split(',').map(s => s.trim()).filter(s => s);
        imports.forEach(i => lucideImports.add(i));
    }
    
    // Check which icons we need based on what's used in the file
    NEEDED_ICONS.forEach(icon => {
        if (content.includes(`<${icon}`) && !lucideImports.has(icon)) {
            lucideImports.add(icon);
            changed = true;
        }
    });
    
    if (lucideImports.size > 0 && importStatement) {
        const newImport = `import { ${Array.from(lucideImports).join(', ')} } from "lucide-react"`;
        content = content.replace(importStatement, newImport);
    } else if (lucideImports.size > 0 && !importStatement) {
        // If no lucide-react import exists but we need one
        const newImport = `import { ${Array.from(lucideImports).join(', ')} } from "lucide-react";\n`;
        content = content.replace(/("use client";\n?)/, `$1${newImport}`);
    }

    if (content !== fs.readFileSync(file, 'utf8')) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
