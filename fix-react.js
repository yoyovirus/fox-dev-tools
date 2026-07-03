const fs = require('fs');
const path = require('path');

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

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    if (!c.includes('import { useState') && !c.includes('import React')) {
        c = c.replace(/"use client";\n?/, '"use client";\nimport { useState, useRef, useEffect, useCallback } from "react";\n');
        fs.writeFileSync(f, c);
        console.log("Fixed react imports in", f);
    }
});
