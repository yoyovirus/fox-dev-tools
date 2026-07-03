const fs = require('fs');

let content = fs.readFileSync('src/app/en/base64-tools/base64-encoder-decoder/page.tsx', 'utf8');

// 1. Imports
content = content.replace(/import \{[^}]+\} from "@mui\/material";/g, '');
content = content.replace(/import \{[^}]+\} from "@mui\/icons-material";/g, '');
content = `import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Copy, Trash2, ArrowRightLeft, FileUp, FileText, CheckCircle2, AlertCircle, File, Archive } from "lucide-react";
${content}`;

content = content.replace(/const theme = useTheme\(\);/g, '');

content = content.replace(/<Box[^>]*flexDirection: \{ xs: "column", md: "row" \}[^>]*>/g, '<div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[500px]">');
content = content.replace(/<Box[^>]*\/>/g, '<div />');
content = content.replace(/<Box[^>]*>/g, '<div>');
content = content.replace(/<\/Box>/g, '</div>');
content = content.replace(/<Stack[^>]*>/g, '<div className="flex flex-col gap-4">');
content = content.replace(/<\/Stack>/g, '</div>');
content = content.replace(/<Paper[^>]*>/g, '<div className="rounded-lg border shadow-sm">');
content = content.replace(/<\/Paper>/g, '</div>');

content = content.replace(/<Typography[^>]*>([\s\S]*?)<\/Typography>/g, '<div className="text-sm font-medium text-muted-foreground">$1</div>');

content = content.replace(/<Tooltip title="([^"]+)">([\s\S]*?)<\/Tooltip>/g, '<Tooltip><TooltipTrigger asChild>$2</TooltipTrigger><TooltipContent>$1</TooltipContent></Tooltip>');

content = content.replace(/<IconButton[^>]*onClick=\{([^}]+)\}[^>]*>([\s\S]*?)<\/IconButton>/g, '<Button variant="ghost" size="icon" onClick={$1}>$2</Button>');

content = content.replace(/<Alert[^>]*>([\s\S]*?)<\/Alert>/g, '<Alert variant="destructive"><AlertDescription>$1</AlertDescription></Alert>');

content = content.replace(/<Button[^>]*onClick=\{([^}]+)\}[^>]*>([\s\S]*?)<\/Button>/g, '<Button variant="outline" size="sm" onClick={$1}>$2</Button>');

// Icons
content = content.replace(/<DownloadIcon[^>]*\/>/g, '<Download className="size-4" />');
content = content.replace(/<DeleteOutline[^>]*\/>/g, '<Trash2 className="size-4" />');
content = content.replace(/<ContentCopy[^>]*\/>/g, '<Copy className="size-4" />');
content = content.replace(/<SwapHorizIcon[^>]*\/>/g, '<ArrowRightLeft className="size-4" />');
content = content.replace(/<FilePresent[^>]*\/>/g, '<FileText className="size-10" />');
content = content.replace(/<FolderZip[^>]*\/>/g, '<Archive className="size-10" />');

// Switches
content = content.replace(/<FormControlLabel[^>]*control=\{\s*<Switch\s*checked=\{([^}]+)\}\s*onChange=\{([^}]+)\}\s*\/>\s*\}[^>]*label="([^"]+)"[^>]*\/>/g, '<div className="flex items-center space-x-2"><Switch checked={$1} onCheckedChange={(checked) => $2({target: {checked}} as any)} /><Label>$3</Label></div>');


// Misc
content = content.replace(/<Divider[^>]*\/>/g, '<Separator orientation="vertical" className="h-5 mx-2" />');
content = content.replace(/<Snackbar[^>]*\/>/g, '');

fs.writeFileSync('src/app/en/base64-tools/base64-encoder-decoder/page.tsx', content);
console.log("Migrated base64-encoder-decoder correctly");
