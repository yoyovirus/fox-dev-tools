const fs = require('fs');
let f = 'src/app/en/base64-tools/base64-encoder-decoder/page.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/variant="contained"/g, '');
c = c.replace(/startIcon=\{<[^>]+>\}/g, '');
c = c.replace(/sx=\{[^{]*\{[^}]*\}[^}]*\}/g, '');
c = c.replace(/sx=\{[^}]+\}/g, '');
// Also fix the FormControlLabel bug since git checkout wiped it out
c = c.replace(/<FormControlLabel[^>]*control=\{\s*<Switch\s*checked=\{([^}]+)\}\s*onChange=\{([^}]+)\}\s*\/>\s*\}[^>]*label="([^"]+)"[^>]*\/>/g, '<div className="flex items-center space-x-2"><Switch checked={$1} onCheckedChange={(checked) => $2({target: {checked}} as any)} /><Label>$3</Label></div>');
c = c.replace(/<FormControlLabel[\s\S]*?control={<Switch checked=\{isUrlSafe\} onChange=\{handleUrlSafeToggle\} size="small" \/>}[\s\S]*?label={<div className="text-sm font-medium text-muted-foreground">URL Safe<\/div>}[\s\S]*?\/>/, '<div className="flex items-center space-x-2"><Switch checked={isUrlSafe} onCheckedChange={(checked) => handleUrlSafeToggle({target: {checked}} as any)} /><Label className="text-sm font-medium text-muted-foreground">URL Safe</Label></div>');

fs.writeFileSync(f, c);
console.log("Fixed base64");
