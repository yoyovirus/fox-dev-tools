const fs = require('fs');
const filePath = 'src/app/en/json-tools/json-to-table/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Imports
content = content.replace(/import {[^}]+} from "@mui\/material";/g, '');
content = content.replace(/import {[^}]+} from "@mui\/icons-material";/g, 'import { Search, Download, Copy, X as ClearIcon, Trash2 as DeleteOutline } from "lucide-react";');
content = `import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
${content}`;

// Hooks
content = content.replace(/const theme = useTheme\(\);/g, '');

// Components
content = content.replace(/<Box[^>]*>/g, '<div>');
content = content.replace(/<\/Box>/g, '</div>');
content = content.replace(/<Typography[^>]*>([^<]+)<\/Typography>/g, '<div className="text-sm font-medium text-muted-foreground">$1</div>');
content = content.replace(/<Typography[^>]*>/g, '<div className="text-sm font-medium text-muted-foreground">');
content = content.replace(/<\/Typography>/g, '</div>');

content = content.replace(/<TextField[^>]*onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}[^>]*\/>/g, '<Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />');

content = content.replace(/<Chip[^>]*label=\{([^}]+)\}[^>]*\/>/g, '<Badge variant="outline">{$1}</Badge>');
content = content.replace(/<Button[^>]*onClick=\{([^}]+)\}[^>]*>([\s\S]*?)<\/Button>/g, '<Button variant="outline" size="sm" onClick={$1}>$2</Button>');

content = content.replace(/<Divider[^>]*\/>/g, '<Separator orientation="vertical" className="h-5 mx-1" />');

content = content.replace(/<Tooltip title="([^"]+)">/g, '<Tooltip><TooltipTrigger asChild>');
content = content.replace(/<\/Tooltip>/g, '</TooltipTrigger><TooltipContent><p>Tooltip</p></TooltipContent></Tooltip>');
content = content.replace(/<IconButton[^>]*onClick=\{([^}]+)\}[^>]*>([\s\S]*?)<\/IconButton>/g, '<Button variant="ghost" size="icon" onClick={$1}>$2</Button>');
content = content.replace(/<IconButton[^>]*onClick=\{exportCsv\}[^>]*>([\s\S]*?)<\/IconButton>/g, '<Button variant="ghost" size="icon" onClick={exportCsv}>$1</Button>');
content = content.replace(/<IconButton[^>]*onClick=\{copyMarkdown\}[^>]*>([\s\S]*?)<\/IconButton>/g, '<Button variant="ghost" size="icon" onClick={copyMarkdown}>$1</Button>');

content = content.replace(/<Alert[^>]*>([\s\S]*?)<\/Alert>/g, '<Alert variant="destructive"><AlertDescription>$1</AlertDescription></Alert>');

// Table components
content = content.replace(/<TableContainer[^>]*>/g, '<div className="overflow-x-auto border rounded-lg">');
content = content.replace(/<\/TableContainer>/g, '</div>');
content = content.replace(/<Table[^>]*>/g, '<table className="w-full text-sm text-left">');
content = content.replace(/<\/Table>/g, '</table>');
content = content.replace(/<TableHead[^>]*>/g, '<thead className="text-xs text-muted-foreground uppercase bg-muted">');
content = content.replace(/<\/TableHead>/g, '</thead>');
content = content.replace(/<TableRow[^>]*>/g, '<tr className="border-b">');
content = content.replace(/<\/TableRow>/g, '</tr>');
content = content.replace(/<TableCell[^>]*>/g, '<td className="px-6 py-3">');
content = content.replace(/<\/TableCell>/g, '</td>');

// Icons
content = content.replace(/<SearchIcon[^>]*\/>/g, '<Search className="size-4" />');
content = content.replace(/<DownloadIcon[^>]*\/>/g, '<Download className="size-4" />');
content = content.replace(/<ContentCopyIcon[^>]*\/>/g, '<Copy className="size-4" />');
content = content.replace(/<ClearIcon[^>]*\/>/g, '<ClearIcon className="size-4" />');
content = content.replace(/<DeleteOutline[^>]*\/>/g, '<DeleteOutline className="size-4" />');

// Snackbar removals
content = content.replace(/<Snackbar[^>]*\/>/g, '');

fs.writeFileSync(filePath, content);
console.log("Migrated json-to-table");
