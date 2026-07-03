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
import { Input } from "@/components/ui/input";
import { Copy, Download, Trash2, Shuffle, FileText, SortAsc, SortDesc, ArrowDownUp, Eraser, Scissors, CopyMinus, CopyPlus, ListOrdered, Hash, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function LineToolsPage() {
    const [input, setInput] = useState<string>("");
    const [prefix, setPrefix] = useState<string>("");
    const [suffix, setSuffix] = useState<string>("");

    useEffect(() => {
        document.title = "Line Tools - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const sortLines = (ascending = true) => {
        const lines = input.split('\n').filter(line => line.trim() !== '');
        const sorted = lines.sort((a, b) => ascending ? a.localeCompare(b) : b.localeCompare(a));
        setInput(sorted.join('\n'));
    };
    const reverseLines = () => { setInput(input.split('\n').reverse().join('\n')); };
    const shuffleLines = () => {
        const lines = input.split('\n');
        for (let i = lines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines[i], lines[j]] = [lines[j], lines[i]];
        }
        setInput(lines.join('\n'));
    };
    const removeEmptyLines = () => { setInput(input.split('\n').filter(line => line.trim() !== '').join('\n')); };
    const trimLines = () => { setInput(input.split('\n').map(line => line.trim()).join('\n')); };
    const uniqueLines = () => { setInput([...new Set(input.split('\n'))].join('\n')); };
    const duplicateLines = () => { setInput(input.split('\n').map(line => line + '\n' + line).join('\n')); };
    const numberLines = () => { setInput(input.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')); };
    const removeNumbers = () => { setInput(input.split('\n').map(line => line.replace(/^\d+\.\s*/, '').replace(/\d+/g, '').trim()).filter(line => line !== '').join('\n')); };
    const applyPrefix = () => { if (prefix) setInput(input.split('\n').map(line => prefix + line).join('\n')); };
    const applySuffix = () => { if (suffix) setInput(input.split('\n').map(line => line + suffix).join('\n')); };

    const handleCopy = async () => { try { await navigator.clipboard.writeText(input); } catch {} };
    const handleDownload = () => {
        if (!input) return;
        const blob = new Blob([input], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "lines.txt"; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const clearEditor = () => setInput("");
    const loadSample = () => { setInput("banana\napple\ncherry\ndate\nelderberry\n\napple\nbanana"); };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Line Tools"
                toolColor={getToolColor("Line Tools")}
                description="Sort, reverse, shuffle, and manipulate text lines."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={SortAsc} label="Sort A-Z" onClickAction={() => sortLines(true)} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={SortDesc} label="Sort Z-A" onClickAction={() => sortLines(false)} />
                </div>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={ArrowDownUp} label="Reverse" onClickAction={reverseLines} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={Shuffle} label="Shuffle" onClickAction={shuffleLines} />
                </div>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={Eraser} label="No Empty" onClickAction={removeEmptyLines} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={Scissors} label="Trim" onClickAction={trimLines} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={CopyMinus} label="Unique" onClickAction={uniqueLines} />
                </div>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={CopyPlus} label="Duplicate" onClickAction={duplicateLines} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={ListOrdered} label="Number" onClickAction={numberLines} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none h-8 px-3 text-xs font-medium gap-1.5" icon={Hash} label="Remove #" onClickAction={removeNumbers} />
                </div>
                <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />
                <div className="flex items-center gap-1">
                    <Input className="max-w-[100px] h-8 text-xs" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Prefix" />
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs gap-1.5" onClick={applyPrefix} disabled={!prefix}><Check className="size-3.5" />Apply</Button>
                </div>
                <div className="flex items-center gap-1">
                    <Input className="max-w-[100px] h-8 text-xs" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="Suffix" />
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs gap-1.5" onClick={applySuffix} disabled={!suffix}><Check className="size-3.5" />Apply</Button>
                </div>


                <div className="flex-1" />


            </div>

            <div className="flex-1 min-h-0 flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Input / Output
                    </div>
                    <div className="flex items-center gap-1">
                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                        {input && (
                            <>
                                <Separator orientation="vertical" className="h-4 mx-1" />
                                <CopyButton textToCopy={input} tooltipText="Copy text" />
                                <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={handleDownload} />
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={clearEditor} />
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <Editor value={input} placeholder="Paste your text here and click any line manipulation button above..." onChange={(val) => setInput(val || "")} />
                </div>
            </div>
        </div>
    );
}
