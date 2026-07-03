const fs = require('fs');

// Fix image-to-base64
let f1 = 'src/app/en/base64-tools/image-to-base64/page.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
if (!c1.includes('useState')) {
    c1 = c1.replace(/import \{ ResizablePanelGroup/g, 'import { useState, useCallback, useEffect } from "react";\nimport { Editor } from "@/components/Editor";\nimport { ResizablePanelGroup');
}
fs.writeFileSync(f1, c1);

// Fix base64-encoder-decoder FilePresent/FolderZip
let f2 = 'src/app/en/base64-tools/base64-encoder-decoder/page.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/<FilePresent[^>]*\/>/g, '<FileText className="size-10 text-primary" />');
c2 = c2.replace(/<FolderZip[^>]*\/>/g, '<Archive className="size-10 text-primary" />');
if (!c2.includes('Archive')) {
    c2 = c2.replace(/from "lucide-react";/, 'Archive, FileText from "lucide-react";');
}
fs.writeFileSync(f2, c2);

// Fix json-diff false | {}
let f3 = 'src/app/en/json-tools/json-diff/page.tsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(/\{renderTree\(\[key\], val, isAdded, isRemoved\)\}/g, '{renderTree([key], val, isAdded, isRemoved) as React.ReactNode}');
fs.writeFileSync(f3, c3);

// Fix json-formatter
let f4 = 'src/app/en/json-tools/json-formatter/page.tsx';
let c4 = fs.readFileSync(f4, 'utf8');
c4 = c4.replace(/onChange=\{\(e\) => setIndentSize\(Number\(e\.target\.value\)\)\}/g, 'onChange={(e: any) => setIndentSize(Number(e.target.value))}');
c4 = c4.replace(/value=\{indentSize\}/g, 'value={indentSize.toString()}');
fs.writeFileSync(f4, c4);

// Fix remove-duplicates
let f5 = 'src/app/en/text-tools/remove-duplicates/page.tsx';
let c5 = fs.readFileSync(f5, 'utf8');
c5 = c5.replace(/<div className="flex flex-col gap-2" value=\{mode\} onChange=\{\(e: any\) => setMode\(e\.target\.value\)\}>/g, '<div className="flex flex-col gap-2">');
fs.writeFileSync(f5, c5);

console.log("Cleanup done");
