const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");

const project = new Project();
project.addSourceFilesAtPaths("c:/Users/raulk/Documents/dev/fox-dev-tools/src/app/en/**/*.tsx");

for (const sourceFile of project.getSourceFiles()) {
    let modified = false;
    let hasCopyImport = false;
    
    // Check if it imports CopyButton
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
        if (imp.getModuleSpecifierValue() === "@/components/CopyButton") {
            hasCopyImport = true;
        }
    }

    const copyElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
        .filter(el => el.getTagNameNode().getText() === "Copy");
    
    // Also check for <Copy> ... </Copy> just in case
    const copyElements2 = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
        .filter(el => el.getTagNameNode().getText() === "Copy");

    const allCopyElements = [...copyElements, ...copyElements2];

    if (allCopyElements.length === 0) continue;

    for (const copyEl of allCopyElements) {
        // Find the closest Button
        const button = copyEl.getFirstAncestorByKind(SyntaxKind.JsxElement);
        if (!button || button.getOpeningElement().getTagNameNode().getText() !== "Button") continue;

        const buttonOpening = button.getOpeningElement();
        
        // Find onClick
        const onClickAttr = buttonOpening.getAttribute("onClick");
        if (!onClickAttr) continue;
        
        let textToCopy = "";
        const init = onClickAttr.getInitializer();
        if (init && init.getKind() === SyntaxKind.JsxExpression) {
            const expr = init.getExpression();
            if (expr && expr.getKind() === SyntaxKind.ArrowFunction) {
                const body = expr.getBody();
                if (body.getKind() === SyntaxKind.CallExpression) {
                    const callText = body.getText();
                    // extract argument to copyText(arg), handleCopy(arg), or navigator.clipboard.writeText(arg)
                    const match = callText.match(/\((.*?)\)$/);
                    if (match) {
                        textToCopy = match[1];
                    }
                }
            } else if (expr && expr.getKind() === SyntaxKind.Identifier) {
                 // if onClick={handleCopy} ? We can't easily extract textToCopy if it's external.
                 // We will skip automatic replacement for these, or use textToCopy={output} if we know it.
            }
        }

        // If we couldn't automatically infer the textToCopy, skip it so we don't break the app.
        if (!textToCopy) {
            console.log("Could not infer textToCopy in", sourceFile.getFilePath(), "line", copyEl.getStartLineNumber());
            continue;
        }

        // Find if it has text beside it
        const buttonChildren = button.getJsxChildren();
        let buttonText = "";
        for (const child of buttonChildren) {
            if (child.getKind() === SyntaxKind.JsxText) {
                const txt = child.getText().trim();
                if (txt && txt !== "Copy") {
                    buttonText = txt;
                }
            }
        }

        // Find closest Tooltip
        const tooltip = button.getFirstAncestorByKind(SyntaxKind.JsxElement);
        let tooltipContentText = "";
        let nodeToReplace = button;
        
        if (tooltip && tooltip.getOpeningElement().getTagNameNode().getText() === "TooltipTrigger") {
            const parentTooltip = tooltip.getFirstAncestorByKind(SyntaxKind.JsxElement);
            if (parentTooltip && parentTooltip.getOpeningElement().getTagNameNode().getText() === "Tooltip") {
                const content = parentTooltip.getDescendantsOfKind(SyntaxKind.JsxElement)
                    .find(el => el.getOpeningElement().getTagNameNode().getText() === "TooltipContent");
                if (content) {
                    tooltipContentText = content.getJsxChildren().map(c => c.getText().trim()).join("");
                }
                nodeToReplace = parentTooltip;
            }
        }

        // Create replacement JSX
        let props = [`textToCopy={${textToCopy}}`];
        
        // Variant and size
        const variantAttr = buttonOpening.getAttribute("variant");
        if (variantAttr) props.push(`variant=${variantAttr.getInitializer().getText()}`);
        
        const sizeAttr = buttonOpening.getAttribute("size");
        if (sizeAttr) props.push(`size=${sizeAttr.getInitializer().getText()}`);
        
        // if there is button text like "Original", use tooltipText
        if (buttonText) {
            props.push(`tooltipText="${buttonText}"`);
        } else if (tooltipContentText) {
            props.push(`tooltipText="${tooltipContentText}"`);
        }

        const replacement = `<CopyButton ${props.join(" ")} />`;
        nodeToReplace.replaceWithText(replacement);
        modified = true;
    }

    if (modified) {
        if (!hasCopyImport) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: "@/components/CopyButton",
                namedImports: ["CopyButton"],
            });
        }
        
        // Ensure we remove Copy import if no longer used (optional, but good)
        // For simplicity, we just format and save.
        sourceFile.formatText();
        sourceFile.saveSync();
        console.log("Updated", sourceFile.getFilePath());
    }
}
