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
import { Copy, Download, Trash2, ArrowRightLeft, AlertCircle, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function TextComparePage() {
    const [text1, setText1] = useState<string>("");
    const [text2, setText2] = useState<string>("");
    const [differences, setDifferences] = useState<{ line: number; text1: string; text2: string }[]>([]);

    useEffect(() => {
        document.title = "Text Compare - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const copyText = async (text: string) => {
        try { await navigator.clipboard.writeText(text); } catch { }
    };

    const downloadText = (text: string, filename: string) => {
        if (!text) return;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (!text1.trim() || !text2.trim()) {
            setDifferences([]);
            return;
        }
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const diffs: { line: number; text1: string; text2: string }[] = [];
        const maxLines = Math.max(lines1.length, lines2.length);
        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';
            if (line1 !== line2) {
                diffs.push({ line: i + 1, text1: line1, text2: line2 });
            }
        }
        setDifferences(diffs);
    }, [text1, text2]);

    const clearEditors = () => { setText1(""); setText2(""); setDifferences([]); };
    const swapEditors = () => { const temp = text1; setText1(text2); setText2(temp); };
    const loadSample = () => {
        setText1("Hello World\nThis is line 2\nThis is line 3\nFinal line");
        setText2("Hello World\nThis is line two\nThis is line 3\nLast line");
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Text Compare"
                toolColor={getToolColor("Text Compare")}
                description="Compare two texts side by side and identify differences."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex-1" />
                <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" icon={ArrowRightLeft} tooltipText="Swap input ↔ output" onClickAction={swapEditors} />
            </div>

            {differences.length > 0 && (
                <Alert>
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                        Found <strong>{differences.length}</strong> difference{differences.length !== 1 ? 's' : ''} between the two texts.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Text 1
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                            {text1 && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />

                                    <CopyButton textToCopy={text1} tooltipText="Copy text" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={() => downloadText(text1, "text1.txt")} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => setText1("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={text1} placeholder="Paste your first text here..." onChange={(val) => setText1(val || "")} />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Text 2
                        </div>
                        <div className="flex items-center gap-1">
                            {text2 && (
                                <>

                                    <CopyButton textToCopy={text2} tooltipText="Copy text" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={() => downloadText(text2, "text2.txt")} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => setText2("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={text2} placeholder="Paste your second text here..." onChange={(val) => setText2(val || "")} />
                    </div>
                </div>
            </div>

            {differences.length > 0 && (
                <div className="border border-border rounded-xl p-3 space-y-2 max-h-[200px] overflow-auto">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Differences Summary
                    </div>
                    {differences.slice(0, 10).map((diff, idx) => (
                        <div key={idx} className="text-xs space-y-0.5 border-b border-border/50 pb-2 last:border-b-0">
                            <div className="font-medium text-muted-foreground">Line {diff.line}:</div>
                            <div className="text-red-500">❌ {diff.text1 || '(empty)'}</div>
                            <div className="text-green-500">✓ {diff.text2 || '(empty)'}</div>
                        </div>
                    ))}
                    {differences.length > 10 && (
                        <div className="text-xs text-muted-foreground">
                            ... and {differences.length - 10} more differences
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
