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
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2, ArrowRightLeft, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { computeWordDiff, normalizeText } from "@/lib/utils/diff";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function TextDiffPage() {
    const [text1, setText1] = useState<string>("");
    const [text2, setText2] = useState<string>("");
    const [diffResult, setDiffResult] = useState<string>("");
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [ignoreCase, setIgnoreCase] = useState(false);

    useEffect(() => {
        document.title = "Text Diff - FoX Dev Tools";
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
            setDiffResult("");
            return;
        }
        const normalized1 = normalizeText(text1, ignoreWhitespace, ignoreCase);
        const normalized2 = normalizeText(text2, ignoreWhitespace, ignoreCase);
        if (normalized1 === normalized2) {
            setDiffResult("✓ No differences found!");
            return;
        }
        setDiffResult(computeWordDiff(text1, text2, ignoreWhitespace, ignoreCase));
    }, [text1, text2, ignoreWhitespace, ignoreCase]);

    const clearEditors = () => { setText1(""); setText2(""); setDiffResult(""); };
    const swapEditors = () => { const temp = text1; setText1(text2); setText2(temp); };
    const loadSample = () => {
        setText1("The quick brown fox jumps over the lazy dog.");
        setText2("The quick brown cat leaps over the sleepy dog.");
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Text Diff"
                toolColor={getToolColor("Text Diff")}
                description="Find differences between two texts with highlighted changes."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary shadow-sm" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
                    Ignore whitespace
                </label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary shadow-sm" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
                    Ignore case
                </label>
                <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono bg-muted/50 text-muted-foreground whitespace-nowrap">
                        <span className="text-red-500">[- deleted -]</span>
                    </Badge>
                    <Badge variant="outline" className="font-mono bg-muted/50 text-muted-foreground whitespace-nowrap">
                        <span className="text-green-500">[+ added +]</span>
                    </Badge>
                </div>
                <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />
                <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" icon={ArrowRightLeft} tooltipText="Swap input ↔ output" onClickAction={swapEditors} />
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Original Text
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                            {text1 && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />

                                    <CopyButton textToCopy={text1} tooltipText="Copy text" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={() => downloadText(text1, "original.txt")} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => setText1("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={text1} placeholder="Paste the original text here..." onChange={(val) => setText1(val || "")} />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Modified Text
                        </div>
                        <div className="flex items-center gap-1">
                            {text2 && (
                                <>

                                    <CopyButton textToCopy={text2} tooltipText="Copy text" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={() => downloadText(text2, "modified.txt")} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => setText2("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={text2} placeholder="Paste the modified text here..." onChange={(val) => setText2(val || "")} />
                    </div>
                </div>
            </div>

            {diffResult && (
                <div className="border border-border rounded-xl p-3 max-h-[150px] overflow-auto">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Diff Result
                    </div>
                    <pre className="text-xs whitespace-pre-wrap font-mono">{diffResult}</pre>
                </div>
            )}
        </div>
    );
}
