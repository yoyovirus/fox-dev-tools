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

        // Skip files that don't have MUI imports (already migrated)
        if (!content.includes('@mui/material')) {
            return;
        }

        // 1. Imports
        content = content.replace(/import \{[^}]*\} from "@mui\/material";\n?/s, `import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";\n`);
        
        content = content.replace(/const theme = useTheme\(\);\n?/g, '');

        content = content.replace(/import \{([^}]+)\} from "@mui\/icons-material";\n?/s, (match, icons) => {
            let radixIcons = [];
            if (icons.includes('SwapHoriz')) radixIcons.push('UpdateIcon');
            if (icons.includes('DeleteOutline')) radixIcons.push('TrashIcon');
            if (icons.includes('ContentCopy')) radixIcons.push('CopyIcon');
            if (icons.includes('Download')) radixIcons.push('DownloadIcon');
            if (icons.includes('AutoAwesome')) radixIcons.push('MagicWandIcon');
            if (icons.includes('Check')) radixIcons.push('CheckIcon');
            if (icons.includes('Search')) radixIcons.push('MagnifyingGlassIcon');
            return `import { ${[...new Set(radixIcons)].join(', ')} } from "@radix-ui/react-icons";\n`;
        });

        // 2. Snackbar removal
        content = content.replace(/<Snackbar[^>]*\/>\n?/g, '');
        content = content.replace(/\{snackbarOpen && <Snackbar[^>]*\/>\}\n?/g, '');
        content = content.replace(/const \{ snackbarOpen, snackbarMessage, setSnackbarOpen, handleCopy, handleDownload \} = usePageSnackbar\(\);\n?/g, 'const { handleCopy, handleDownload } = useToolPage();\n');
        content = content.replace(/function usePageSnackbar\(\) \{[\s\S]*?return \{[^}]*\};\n\}\n?/g, '');

        // 3. Tooltip mapping
        content = content.replace(/<Tooltip title="([^"]+)">\s*([\s\S]*?)\s*<\/Tooltip>/g, `<Tooltip>
    <TooltipTrigger asChild>
        $2
    </TooltipTrigger>
    <TooltipContent>$1</TooltipContent>
</Tooltip>`);

        // 4. Box mappings
        content = content.replace(/<Box sx=\{\{\s*height: "100%",\s*display: "flex",\s*flexDirection: "column"[^>]*\}\}>/g, '<div className="h-full flex flex-col gap-4">');
        
        content = content.replace(/<Box sx=\{\{\s*display: "flex",\s*alignItems: "center",\s*gap: \{ xs: 1, sm: 1.5 \},\s*flexWrap: "wrap"[^>]*\}\}>/g, '<Card className="flex items-center gap-2 flex-wrap p-2 shadow-sm rounded-xl">');
        
        content = content.replace(/<Box sx=\{\{\s*flexGrow: 1\s*\}\}\s*\/>/g, '<div className="flex-1" />');
        
        content = content.replace(/<Box sx=\{\{\s*display: "flex",\s*gap: 2,\s*mb: 2\s*\}\}>/g, '<div className="flex gap-4 mb-4">');

        // Headers
        content = content.replace(/<Box sx=\{\{\s*display: \{ xs: "none", md: "flex" \},\s*mb: 1,\s*gap: 0\s*\}\}>/g, '<div className="hidden md:flex mb-2">');

        // Split panes
        content = content.replace(/<Box sx=\{\{\s*flexGrow: 1,\s*display: "flex",\s*flexDirection: \{ xs: "column", md: "row" \}[^>]*\}\}>/g, '<Card className="flex-grow min-h-0 overflow-hidden shadow-sm"><ResizablePanelGroup orientation="horizontal" className="h-full items-stretch">');
        content = content.replace(/<Box sx=\{\{\s*flex: "1 1 0",\s*minWidth: 300,\s*minHeight: 250,\s*display: "flex",\s*flexDirection: "column"\s*\}\}>/g, '<ResizablePanel defaultSize={50} minSize={20}><div className="h-full flex flex-col">');
        
        // Single pane
        content = content.replace(/<Box sx=\{\{\s*flexGrow: 1,\s*display: "flex",\s*flexDirection: "column",\s*minHeight: 0,\s*flex: 1,\s*\}\}>/g, '<Card className="flex-grow min-h-0 overflow-hidden shadow-sm flex flex-col">');
        content = content.replace(/<Box sx=\{\{\s*flexGrow: 1,\s*minHeight: 0,\s*borderRadius: 2\.5,\s*overflow: "hidden",\s*border: `1px solid \$\{theme\.palette\.divider\}`,\s*(bgcolor: "background\.paper",\s*)?\}\}>/g, '<div className="flex-grow min-h-0">');

        // 5. Button & Icon mappings
        content = content.replace(/<SwapHorizIcon[^>]*\/>/g, '<UpdateIcon className="size-4" />');
        content = content.replace(/<DeleteOutline[^>]*\/>/g, '<TrashIcon className="size-4" />');
        content = content.replace(/<ContentCopy[^>]*\/>/g, '<CopyIcon className="size-4 text-muted-foreground" />');
        content = content.replace(/<DownloadIcon[^>]*\/>/g, '<DownloadIcon className="size-4 text-muted-foreground" />');
        content = content.replace(/<AutoAwesome[^>]*\/>/g, '<MagicWandIcon className="size-4" />');

        // Error alerts
        content = content.replace(/<Alert[^>]*severity="error"[^>]*>([\s\S]*?)<\/Alert>/g, '<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2"><div className="size-1.5 rounded-full bg-destructive shrink-0" />$1</div>');
        
        // Typography
        content = content.replace(/<Typography variant="caption" fontWeight=\{800\} color="text\.secondary" sx=\{\{([^}]*)\}\}>\s*(.*?)\s*<\/Typography>/g, '<div className="p-2 border-b bg-muted/20"><span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">$2</span></div>');
        
        // IconButtons to Buttons
        content = content.replace(/<IconButton([^>]*)onClick=\{([^}]+)\}([^>]*)>/g, '<Button variant="ghost" size="icon" className="size-8" onClick={$2}>');
        content = content.replace(/<\/IconButton>/g, '</Button>');
        
        content = content.replace(/<Button variant="ghost" size="icon" className="size-8" onClick=\{([^}]+)\}([^>]*)color="error"([^>]*)>/g, '<Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={$1}>');

        // Standard Buttons
        content = content.replace(/variant="outlined"/g, 'variant="outline"');
        content = content.replace(/variant="contained"/g, 'variant="default"');
        content = content.replace(/size="small"/g, 'size="sm"');
        content = content.replace(/sx=\{\{[^}]*\}\}/g, 'className="rounded-lg gap-1.5"');

        // Divider to Separator
        content = content.replace(/<Divider orientation="vertical" flexItem className="rounded-lg gap-1.5" \/>/g, '<Separator orientation="vertical" className="h-5 mx-1" />');

        // 6. Box closing tags
        content = content.replace(/<\/Box>/g, (match, offset, str) => {
            // Context heuristic:
            // Since we know ResizablePanelGroup/Card structure:
            return '</div>'; // Default, we will fix up ResizablePanel and Card closing tags later in post-processing
        });

        // 7. Fix Split Pane Resizable panel closing tags
        let panelCount = 0;
        content = content.replace(/<ResizablePanel /g, (match) => {
            panelCount++;
            if (panelCount === 2) {
                return '<ResizableHandle withHandle />\n<ResizablePanel ';
            }
            return match;
        });
        
        if (panelCount > 0) {
            // The ResizablePanel needs closing. The structure was:
            // <ResizablePanel><div...> ... </div></div> -> <ResizablePanel><div...> ... </div></ResizablePanel>
            // We can just find the end of the file and manually fix the closing tags because they are simple.
            content = content.replace(/<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);/g, '</ResizablePanel>\n</ResizablePanelGroup>\n</Card>\n</div>\n);');
        } else {
            // Single pane closing tags
            content = content.replace(/<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);/g, '</div>\n</Card>\n</div>\n);');
        }

        // Write
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            count++;
        }
    }
});

console.log("Migrated " + count + " tools to Shadcn.");
