/*
  Website: FoX Dev Tools - Tools for Developers
  Author: Rahul Khedekar
  Copyright © 2026 FoX Dev Tools. All rights reserved.

  This code is proprietary and may not be copied, modified,
  or distributed without permission.
*/
"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, Trash2, AlertCircle, FileText, Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

function generateTypeScript(jsonStr: string, rootName = "Root"): string {
    try {
        const obj = JSON.parse(jsonStr);
        const interfaces: string[] = [];

        const getType = (val: any, name: string): string => {
            if (val === null) return "any";
            if (Array.isArray(val)) {
                if (val.length === 0) return "any[]";
                return getType(val[0], name + "Item") + "[]";
            }
            if (typeof val === "object") {
                const interfaceName = name.charAt(0).toUpperCase() + name.slice(1);
                const fields = Object.entries(val).map(([k, v]) => {
                    return `  ${k}: ${getType(v, k)};`;
                });
                interfaces.push(`export interface ${interfaceName} {\n${fields.join("\n")}\n}`);
                return interfaceName;
            }
            return typeof val;
        };

        getType(obj, rootName);
        return interfaces.reverse().join("\n\n");
    } catch (e) {
        return "// Invalid JSON input";
    }
}

function generateGoStructs(jsonStr: string, rootName = "Root"): string {
    try {
        const obj = JSON.parse(jsonStr);
        const structs: string[] = [];

        const getType = (val: any, name: string): string => {
            if (val === null) return "any";
            if (Array.isArray(val)) {
                if (val.length === 0) return "[]any";
                return "[]" + getType(val[0], name + "Item");
            }
            if (typeof val === "object") {
                const structName = name.charAt(0).toUpperCase() + name.slice(1);
                const fields = Object.entries(val).map(([k, v]) => {
                    const fieldName = k.charAt(0).toUpperCase() + k.slice(1);
                    return `  ${fieldName} ${getType(v, k)} \`json:"${k}"\``;
                });
                structs.push(`type ${structName} struct {\n${fields.join("\n")}\n}`);
                return structName;
            }
            if (typeof val === "number") return "float64";
            if (typeof val === "boolean") return "bool";
            return "string";
        };

        getType(obj, rootName);
        return structs.reverse().join("\n\n");
    } catch (e) {
        return "// Invalid JSON input";
    }
}

const SAMPLE_JSON_TYPE_GENERATOR = `{
  "id": 1,
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "active": true
  },
  "tags": ["admin", "editor"],
  "score": 9.5
}`;

export default function TypeGeneratorPage() {
    const [input, setInput] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [language, setLanguage] = useState<"typescript" | "go">("typescript");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!input.trim()) {
            setError(null);
            setOutput("");
            return;
        }
        try {
            JSON.parse(input);
            setError(null);
            if (language === "typescript") {
                setOutput(generateTypeScript(input));
            } else {
                setOutput(generateGoStructs(input));
            }
        } catch (e: any) {
            setError(e.message);
        }
    }, [input, language]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
        } catch (err) { }
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: language === "typescript" ? "application/typescript" : "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = language === "typescript" ? "types.ts" : "structs.go";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="JSON Type Generator"
                toolColor={getToolColor("JSON Type Generator")}
                description="Automatically generate TypeScript interfaces and Go structs from any JSON structure."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex rounded-md border shadow-sm">
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 border-r ${language === 'typescript' ? 'bg-muted' : ''}`} onClick={() => setLanguage('typescript')}>
                        <Code2 className="size-3.5" /> TypeScript
                    </button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${language === 'go' ? 'bg-muted' : ''}`} onClick={() => setLanguage('go')}>
                        <Code2 className="size-3.5" /> Go Structs
                    </button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            JSON Input
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={() => setInput(SAMPLE_JSON_TYPE_GENERATOR)} />
                            {(input || output) && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />

                                    <CopyButton textToCopy={input} tooltipText="Copy Input" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Input" onClickAction={() => {
                                                const blob = new Blob([input], { type: "application/json" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "input.json"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear All" onClickAction={() => { setInput(""); setOutput(""); }} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            value={input}
                            placeholder="Paste your JSON here..."
                            onChange={(val) => setInput(val || "")}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {language === "typescript" ? "TypeScript" : "Go"} Output
                        </div>
                        <div className="flex items-center gap-1">
                            {output && (
                                <>
                                    <CopyButton textToCopy={output} tooltipText="Copy Types" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Types" onClickAction={handleDownload} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={() => { setInput(""); setOutput(""); }} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            value={output}
                            language={language}
                            readOnly={true}
                            placeholder="Generated types/structs will appear here..."
                            onChange={() => { }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
