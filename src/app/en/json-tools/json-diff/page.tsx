"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyButton } from "@/components/CopyButton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Trash2, ArrowRightLeft, AlertCircle, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { JsonDiffEditor } from "@/components/JsonDiffEditor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function DiffPage() {
    const [original, setOriginal] = useState<string>("");
    const [modified, setModified] = useState<string>("");
    const [origError, setOrigError] = useState<string | null>(null);
    const [modError, setModError] = useState<string | null>(null);

    useEffect(() => {
        if (!original.trim()) {
            setOrigError(null);
        } else {
            try {
                JSON.parse(original);
                setOrigError(null);
            } catch (e: any) {
                setOrigError(e.message);
            }
        }
    }, [original]);

    useEffect(() => {
        if (!modified.trim()) {
            setModError(null);
        } else {
            try {
                JSON.parse(modified);
                setModError(null);
            } catch (e: any) {
                setModError(e.message);
            }
        }
    }, [modified]);

    const swap = () => {
        const temp = original;
        setOriginal(modified);
        setModified(temp);
    };

    const clearEditors = () => {
        setOriginal("");
        setModified("");
        setOrigError(null);
        setModError(null);
    };

    const loadSample = () => {
        setOriginal(JSON.stringify({
            "name": "John Doe",
            "age": 30,
            "city": "New York",
            "skills": ["React", "TypeScript", "Node.js"]
        }, null, 2));
        setModified(JSON.stringify({
            "name": "John Doe",
            "age": 31,
            "city": "San Francisco",
            "skills": ["React", "TypeScript", "Next.js"]
        }, null, 2));
    };

    const handleCopy = async (text: string) => {
        try { await navigator.clipboard.writeText(text); } catch { }
    };

    return (
        <div className="h-full flex flex-col gap-4 min-h-[600px]">
            <ToolHeader
                toolName="JSON Diff"
                toolColor={getToolColor("JSON Diff")}
                description="Compare two JSON objects and highlight their differences."
            />



            {Boolean(origError || modError) && (
                <div className="flex flex-col md:flex-row gap-4">
                    {Boolean(origError) && (
                        <Alert variant="destructive" className="flex-1">
                            <AlertCircle className="size-4" />
                            <AlertDescription>Original JSON Error: {origError}</AlertDescription>
                        </Alert>
                    )}
                    {Boolean(modError) && (
                        <Alert variant="destructive" className="flex-1">
                            <AlertCircle className="size-4" />
                            <AlertDescription>Modified JSON Error: {modError}</AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            <div className="flex-1 min-h-0 flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <span>Original</span>
                        <ArrowRightLeft className="size-3" />
                        <span>Modified</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                        <AnimatedButton variant="ghost" size="icon" className="size-7" icon={ArrowRightLeft} tooltipText="Swap input ↔ output" onClickAction={swap} />
                        {(original || modified) && (
                            <>
                                <Separator orientation="vertical" className="h-4 mx-1" />
                                {original && (
                                    <>
                                        <CopyButton textToCopy={original} tooltipText="Original" size="sm" className="h-7 px-2 text-xs gap-1.5" />
                                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={Download} tooltipText="Download Original JSON" onClickAction={() => {
                                                    const blob = new Blob([original], { type: "application/json" });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url; a.download = "original.json"; document.body.appendChild(a); a.click();
                                                    document.body.removeChild(a); URL.revokeObjectURL(url);
                                                }} />
                                    </>
                                )}
                                {modified && (
                                    <>
                                        <CopyButton textToCopy={modified} tooltipText="Modified" size="sm" className="h-7 px-2 text-xs gap-1.5" />
                                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={Download} tooltipText="Download Modified JSON" onClickAction={() => {
                                                    const blob = new Blob([modified], { type: "application/json" });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url; a.download = "modified.json"; document.body.appendChild(a); a.click();
                                                    document.body.removeChild(a); URL.revokeObjectURL(url);
                                                }} />
                                    </>
                                )}
                                <Separator orientation="vertical" className="h-4 mx-1" />
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={clearEditors} />
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-h-0 relative">
                    <JsonDiffEditor
                        original={original}
                        modified={modified}
                    />
                </div>
            </div>
        </div>
    );
}
