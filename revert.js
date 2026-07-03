const fs = require('fs');
const { Project, SyntaxKind } = require('ts-morph');
const project = new Project();
project.addSourceFilesAtPaths('c:/Users/raulk/Documents/dev/fox-dev-tools/src/app/en/**/*.tsx');
for (const sourceFile of project.getSourceFiles()) {
    const copyBtns = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
        .filter(el => el.getTagNameNode().getText() === 'CopyButton');
    if (copyBtns.length === 0) continue;
    let modified = false;
    for (const btn of copyBtns) {
        let textToCopy = '\"\"';
        let tooltipText = '\"Copy\"';
        let variant = '\"ghost\"';
        let size = '\"icon\"';
        
        for (const attr of btn.getAttributes()) {
            if (attr.getNameNode().getText() === 'textToCopy') textToCopy = attr.getInitializer().getText();
            if (attr.getNameNode().getText() === 'tooltipText') tooltipText = attr.getInitializer().getText();
            if (attr.getNameNode().getText() === 'variant') variant = attr.getInitializer().getText();
            if (attr.getNameNode().getText() === 'size') size = attr.getInitializer().getText();
        }
        
        const orig = `
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant=${variant} size=${size} className=${size === '"icon"' ? '"size-7"' : '"h-7 px-2 text-xs gap-1.5"'} onClick={() => navigator.clipboard.writeText(${textToCopy.startsWith('{') ? textToCopy.slice(1, -1) : textToCopy})}>
                        <Copy className="size-3.5" />${size !== '"icon"' ? ' ' + tooltipText.replace(/"/g, '') : ''}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>${tooltipText.replace(/"/g, '')}</TooltipContent>
            </Tooltip>`;
            
        btn.replaceWithText(orig);
        modified = true;
    }
    if (modified) {
        const imports = sourceFile.getImportDeclarations().filter(imp => imp.getModuleSpecifierValue() === '@/components/CopyButton');
        for (const imp of imports) imp.remove();
        sourceFile.formatText();
        sourceFile.saveSync();
        console.log('Reverted in ' + sourceFile.getFilePath());
    }
}
