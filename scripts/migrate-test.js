const fs = require('fs');

function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Remove MUI imports
    content = content.replace(/import \{[^}]*\} from "@mui\/material";\n?/s, `import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";\n`);

    // Remove useTheme
    content = content.replace(/const theme = useTheme\(\);\n?/g, '');

    // Replace MUI icons with Radix icons
    content = content.replace(/import \{([^}]+)\} from "@mui\/icons-material";\n?/s, (match, icons) => {
        let radixIcons = [];
        if (icons.includes('SwapHoriz')) radixIcons.push('UpdateIcon');
        if (icons.includes('DeleteOutline')) radixIcons.push('TrashIcon');
        if (icons.includes('ContentCopy')) radixIcons.push('CopyIcon');
        if (icons.includes('Download')) radixIcons.push('DownloadIcon');
        if (icons.includes('AutoAwesome')) radixIcons.push('MagicWandIcon');
        if (icons.includes('Check')) radixIcons.push('CheckIcon');
        if (icons.includes('Search')) radixIcons.push('MagnifyingGlassIcon');
        // fallback
        radixIcons.push('MagicWandIcon as FallbackIcon');
        
        // Return unique radix icons
        return `import { ${[...new Set(radixIcons)].join(', ')} } from "@radix-ui/react-icons";\n`;
    });

    // Outer wrapper
    content = content.replace(/<Box sx=\{\{\s*height: "100%",\s*display: "flex",\s*flexDirection: "column"(.*?)\}\}>/g, '<div className="h-full flex flex-col gap-0">');

    // Toolbar (assuming it has display: "flex", alignItems: "center", gap...)
    content = content.replace(/<Box sx=\{\{\s*display: "flex",\s*alignItems: "center",\s*gap: \{ xs: 1, sm: 1.5 \},\s*flexWrap: "wrap",\s*p: \{ xs: 1, sm: 1.25 \},\s*mb: 2,\s*bgcolor: "background\.paper",\s*borderRadius: 2\.5,\s*border: `1px solid \$\{theme\.palette\.divider\}`,\s*\}\}>/g, '<Card className="flex items-center gap-2 flex-wrap p-2 shadow-sm rounded-xl mb-4">');

    // Box flexGrow: 1 inside toolbar -> div
    content = content.replace(/<Box sx=\{\{\s*flexGrow: 1\s*\}\}\s*\/>/g, '<div className="flex-1" />');

    // Divider -> Separator
    content = content.replace(/<Divider orientation="vertical" flexItem sx=\{\{ mx: 0\.5, height: 20, alignSelf: "center", ml: 1\.5 \}\} \/>/g, '<Separator orientation="vertical" className="h-5 mx-1" />');
    
    // Snackbar removal
    content = content.replace(/<Snackbar[^>]*\/>\n?/g, '');
    content = content.replace(/\{snackbarOpen && <Snackbar[^>]*\/>\}\n?/g, '');
    content = content.replace(/\{snackbarOpen && \(\n\s*<Snackbar[^>]*\/>\n\s*\)\}\n?/g, '');

    // Alert error handling
    content = content.replace(/<Alert[^>]*severity="error"[^>]*>([\s\S]*?)<\/Alert>/g, '<div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2"><div className="size-1.5 rounded-full bg-destructive shrink-0" />$1</div>');
    
    // Typography -> span/h3
    content = content.replace(/<Typography variant="caption" fontWeight=\{800\} color="text\.secondary" sx=\{\{([^}]*)\}\}>\s*(.*?)\s*<\/Typography>/g, '<span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">$2</span>');

    // Icons tags <SwapHorizIcon sx={{...}} /> -> <UpdateIcon className="size-4" />
    content = content.replace(/<SwapHorizIcon[^>]*\/>/g, '<UpdateIcon className="size-4" />');
    content = content.replace(/<DeleteOutline[^>]*\/>/g, '<TrashIcon className="size-4" />');
    content = content.replace(/<ContentCopy[^>]*\/>/g, '<CopyIcon className="size-4 text-muted-foreground" />');
    content = content.replace(/<DownloadIcon[^>]*\/>/g, '<DownloadIcon className="size-4 text-muted-foreground" />');
    content = content.replace(/<AutoAwesome[^>]*\/>/g, '<MagicWandIcon className="size-4" />');

    // IconButton -> Button
    content = content.replace(/<IconButton([^>]*)onClick=\{([^}]+)\}([^>]*)>/g, '<Button variant="ghost" size="icon" className="size-8" onClick={$2}>');
    content = content.replace(/<\/IconButton>/g, '</Button>');

    // Add text-destructive to Clear buttons
    content = content.replace(/<Button variant="ghost" size="icon" className="size-8" onClick=\{([^}]+)\}([^>]*)color="error"([^>]*)>/g, '<Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={$1}>');

    // Buttons variant
    content = content.replace(/variant="outlined"/g, 'variant="outline"');
    content = content.replace(/variant="contained"/g, 'variant="default"');
    content = content.replace(/size="small"/g, 'size="sm"');
    
    // Tooltip <Tooltip title="..."><Button.../></Tooltip> -> Shadcn Tooltip
    // This is hard with regex because of nesting.
    
    // Instead of replacing Tooltip tags entirely, just make them Shadcn Tooltip
    // <Tooltip title="xyz"> -> <Tooltip><TooltipTrigger asChild>
    content = content.replace(/<Tooltip title=([^>]+)>/g, '<Tooltip><TooltipTrigger asChild>');
    // </Tooltip> -> </TooltipTrigger><TooltipContent>{title}</TooltipContent></Tooltip>
    // Wait, we don't have the title variable easily. We can do a sophisticated regex replacement.
    
    // Instead of regex for tooltip, let's just do it manually for complex tools, and do simple replaces.
    // Let me write the output to a temporary file to see the diff!
    fs.writeFileSync(filePath + '.test', content, 'utf8');
}

migrateFile('./src/app/en/json-tools/json-diff/page.tsx');
