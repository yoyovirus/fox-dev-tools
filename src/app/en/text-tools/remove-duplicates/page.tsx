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
import { Copy, Download, Trash2, FileText } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function RemoveDuplicatesPage() {
    const [input, setInput] = useState<string>("");
    const [mode, setMode] = useState<"lines" | "words" | "characters">("lines");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [keepEmpty, setKeepEmpty] = useState(false);

    useEffect(() => {
        document.title = "Remove Duplicates - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const output = useMemo(() => {
        if (!input) return "";
        if (mode === "lines") {
            let lines = input.split('\n');
            if (!keepEmpty) lines = lines.filter(line => line.trim() !== '');
            const seen = new Set<string>();
            return lines.filter(line => {
                const key = caseSensitive ? line : line.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key); return true;
            }).join('\n');
        } else if (mode === "words") {
            const words = input.split(/(\s+)/);
            const seen = new Set<string>();
            return words.map(word => {
                if (/^\s+$/.test(word)) return word;
                const key = caseSensitive ? word : word.toLowerCase();
                if (seen.has(key)) return '';
                seen.add(key); return word;
            }).filter(w => w !== '' || keepEmpty).join('');
        } else {
            const seen = new Set<string>();
            return input.split('').filter(char => {
                const key = caseSensitive ? char : char.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key); return true;
            }).join('');
        }
    }, [input, mode, caseSensitive, keepEmpty]);

    const stats = useMemo(() => {
        const originalCount = mode === "lines"
            ? input.split('\n').filter(l => keepEmpty || l.trim()).length
            : mode === "words"
                ? input.trim().split(/\s+/).filter(w => keepEmpty || w.trim()).length
                : input.length;
        const newCount = mode === "lines"
            ? output.split('\n').filter(l => keepEmpty || l.trim()).length
            : mode === "words"
                ? output.trim().split(/\s+/).filter(w => keepEmpty || w.trim()).length
                : output.length;
        return { original: originalCount, removed: originalCount - newCount, result: newCount };
    }, [input, output, mode, keepEmpty]);

    const clearAll = () => setInput("");
    const loadSample = () => setInput("apple\nbanana\nApple\ncherry\nbanana\ndate\napple\nelderberry");

    const handleCopyOutput = async () => { try { await navigator.clipboard.writeText(output); } catch { } };
    const handleDownloadOutput = () => {
        if (!output) return;
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "deduplicated.txt"; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Remove Duplicates"
                toolColor={getToolColor("Remove Duplicates")}
                description="Remove duplicate lines or words from your text."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <span className="text-xs font-medium text-muted-foreground">Mode:</span>
                <div className="flex rounded-md border shadow-sm overflow-hidden">
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium border-r ${mode === 'lines' ? 'bg-muted' : ''}`} onClick={() => setMode('lines')}>Lines</button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium border-r ${mode === 'words' ? 'bg-muted' : ''}`} onClick={() => setMode('words')}>Words</button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium ${mode === 'characters' ? 'bg-muted' : ''}`} onClick={() => setMode('characters')}>Chars</button>
                </div>
                <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary shadow-sm" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
                    Case sensitive
                </label>
                {mode === "lines" && (
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-primary shadow-sm" checked={keepEmpty} onChange={(e) => setKeepEmpty(e.target.checked)} />
                        Keep empty
                    </label>
                )}


                <div className="flex-1" />


            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Input
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                            {input && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />

                                    <CopyButton textToCopy={input} tooltipText="Copy Input" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Input" onClickAction={() => {
                                                const blob = new Blob([input], { type: "text/plain" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "input.txt"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Input" onClickAction={clearAll} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={input} placeholder="Paste your text here..." onChange={(val) => setInput(val || "")} />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Deduplicated Output
                            {output && (
                                <div className="ml-3 flex gap-2">
                                    <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`Orig: ${stats.original}`}</Badge>
                                    <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`Rem: ${stats.removed}`}</Badge>
                                    <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`Res: ${stats.result}`}</Badge>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {output && (
                                <>
                                    <CopyButton textToCopy={output} tooltipText="Copy Output" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Output" onClickAction={handleDownloadOutput} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={clearAll} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={output} onChange={() => { }} readOnly placeholder="Deduplicated result will appear here..." />
                    </div>
                </div>
            </div>
        </div>
    );
}
