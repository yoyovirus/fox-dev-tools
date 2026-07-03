const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir("src/app/en", function (filePath) {
    if (filePath.endsWith("page.tsx")) {
        let content = fs.readFileSync(filePath, "utf8");
        let originalContent = content;

        // Fix SnackbarProps
        content = content.replace(/,\s*SnackbarProps/g, "");
        content = content.replace(/\{ SnackbarProps\s*\}/g, "{}");

        // Fix Stack
        content = content.replace(/<Stack[^>]*>/g, '<div className="flex flex-col gap-3">');
        content = content.replace(/<\/Stack>/g, '</div>');

        // Fix UploadIcon, FileIcon
        content = content.replace(/<UploadIcon[^>]*\/>/g, '<Upload className="size-4" />');
        content = content.replace(/<FileIcon[^>]*\/>/g, '<FileText className="size-4" />');
        if (content.includes("Upload className=") && !content.includes("Upload,")) {
             content = content.replace(/from "lucide-react";/, 'Upload, FileText, from "lucide-react";');
        }

        // Fix setFormat in blabber
        if (filePath.includes("blabber")) {
            content = content.replace(/setFormat\(/g, "setWordStyle(");
        }

        // Fix boolean to string issue in find-replace and image-to-base64
        // onChange={(e) => setCaseSensitive(e.target.checked)} -> it's boolean, but maybe the state is string?
        // Let's just fix Alert variants in find-replace:
        content = content.replace(/severity="outlined"/g, 'variant="outline"');
        content = content.replace(/severity="small"/g, 'variant="default"');
        content = content.replace(/size="small"/g, '');

        // Fix json-to-table Table elements
        if (filePath.includes("json-to-table")) {
            content = content.replace(/<TableContainer[^>]*>/g, '<div className="overflow-x-auto w-full">');
            content = content.replace(/<\/TableContainer>/g, '</div>');
            content = content.replace(/<Table[^>]*>/g, '<table className="w-full text-sm text-left border">');
            content = content.replace(/<\/Table>/g, '</table>');
            content = content.replace(/<TableHead[^>]*>/g, '<thead className="text-xs text-muted-foreground uppercase bg-muted/50">');
            content = content.replace(/<\/TableHead>/g, '</thead>');
            content = content.replace(/<TableRow[^>]*>/g, '<tr className="border-b">');
            content = content.replace(/<\/TableRow>/g, '</tr>');
            content = content.replace(/<TableCell[^>]*>/g, '<td className="px-6 py-3">');
            content = content.replace(/<\/TableCell>/g, '</td>');
            content = content.replace(/<TableBody[^>]*>/g, '<tbody>');
            content = content.replace(/<\/TableBody>/g, '</tbody>');
            content = content.replace(/<Paper[^>]*>/g, '<div className="rounded-lg shadow">');
            content = content.replace(/<\/Paper>/g, '</div>');
        }

        // Fix json-formatter FormControl and MenuItem
        if (filePath.includes("json-formatter")) {
            content = content.replace(/<FormControl[^>]*>/g, '<div className="flex flex-col">');
            content = content.replace(/<\/FormControl>/g, '</div>');
            content = content.replace(/<MenuItem value=\{([^}]+)\}>([^<]+)<\/MenuItem>/g, '<option value={$1}>$2</option>');
            content = content.replace(/<MenuItem value="([^"]+)">([^<]+)<\/MenuItem>/g, '<option value="$1">$2</option>');
        }
        
        // Remove trailing commas in imports caused by injection
        content = content.replace(/,\s*from "lucide-react";/g, ' from "lucide-react";');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, "utf8");
            console.log("Migrated " + filePath);
        }
    }
});
