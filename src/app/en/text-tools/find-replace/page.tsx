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
import { Copy, Download, Trash2, Replace, ChevronUp, ChevronDown, FileText, ReplaceAll } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function FindReplacePage() {
    const [input, setInput] = useState<string>("");
    const [findText, setFindText] = useState<string>("");
    const [replaceText, setReplaceText] = useState<string>("");
    const [matchCase, setMatchCase] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
    const [matches, setMatches] = useState<{ start: number; end: number; text: string }[]>([]);
    const editorRef = useRef<any>(null);

    useEffect(() => {
        document.title = "Find & Replace - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    useEffect(() => {
        if (!findText || !input) {
            setMatchCount(0);
            setMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }
        try {
            const flags = matchCase ? 'g' : 'gi';
            const pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(pattern, flags);
            const foundMatches: { start: number; end: number; text: string }[] = [];
            let match;
            while ((match = regex.exec(input)) !== null) {
                foundMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
            }
            setMatches(foundMatches);
            setMatchCount(foundMatches.length);
            setCurrentMatchIndex(foundMatches.length > 0 ? 0 : -1);
        } catch (e) {
            setMatchCount(0);
            setMatches([]);
            setCurrentMatchIndex(-1);
        }
    }, [findText, input, matchCase, useRegex]);

    useEffect(() => {
        if (editorRef.current && currentMatchIndex >= 0 && matches.length > 0) {
            const match = matches[currentMatchIndex];
            const position = editorRef.current.getModel().getPositionAt(match.start);
            const endPosition = editorRef.current.getModel().getPositionAt(match.end);
            editorRef.current.setSelection({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: endPosition.lineNumber,
                endColumn: endPosition.column,
            });
            editorRef.current.revealPositionInCenter(position);
        }
    }, [currentMatchIndex, matches]);

    const handleEditorMount = (editor: any) => { editorRef.current = editor; };
    const findNext = () => { if (matches.length === 0) return; setCurrentMatchIndex((prev) => (prev + 1) % matches.length); };
    const findPrevious = () => { if (matches.length === 0) return; setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length); };

    const replace = () => {
        if (!findText || !input || currentMatchIndex < 0) return;
        const match = matches[currentMatchIndex];
        const newInput = input.substring(0, match.start) + replaceText + input.substring(match.end);
        setInput(newInput);
        setMatches([]);
        setCurrentMatchIndex(-1);
    };

    const replaceAll = () => {
        if (!findText || !input || matches.length === 0) return;
        const flags = matchCase ? 'g' : 'gi';
        const pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(pattern, flags);
        setInput(input.replace(regex, replaceText));
        setMatches([]);
        setCurrentMatchIndex(-1);
    };

    const handleCopy = async () => { try { await navigator.clipboard.writeText(input); } catch {} };
    const handleDownload = () => {
        if (!input) return;
        const blob = new Blob([input], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "text.txt"; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const clearAll = () => { setInput(""); setFindText(""); setReplaceText(""); setMatchCount(0); };
    const loadSample = () => { setInput("The quick brown fox jumps over the lazy dog. The fox was very quick."); setFindText("fox"); setReplaceText("cat"); };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Find & Replace"
                toolColor={getToolColor("Find & Replace")}
                description="Search and replace text with support for regex."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <Input className="max-w-[180px] h-8 text-xs" value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Find..." />
                {matches.length > 0 && (
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {currentMatchIndex + 1} / {matches.length}
                    </span>
                )}
                <Input className="max-w-[180px] h-8 text-xs" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace with..." />
                <AnimatedButton variant="outline" size="icon" className="size-8" disabled={matches.length === 0} icon={ChevronUp} onClickAction={findPrevious} />
                <AnimatedButton variant="outline" size="icon" className="size-8" disabled={matches.length === 0} icon={ChevronDown} onClickAction={findNext} />
                <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" disabled={!findText || !replaceText || currentMatchIndex < 0} icon={Replace} label="Replace" onClickAction={replace} />
                <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" disabled={!findText || !replaceText || matchCount === 0} icon={ReplaceAll} label="Replace All" onClickAction={replaceAll} />
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary shadow-sm" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
                    Match case
                </label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary shadow-sm" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
                    Regex
                </label>


                <div className="flex-1" />


            </div>

            <div className="flex-1 min-h-0 flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Text
                    </div>
                    <div className="flex items-center gap-1">
                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                        {input && (
                            <>
                                <Separator orientation="vertical" className="h-4 mx-1" />
                                <CopyButton textToCopy={input} tooltipText="Copy text" />
                                <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={handleDownload} />
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear all" onClickAction={clearAll} />
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <Editor
                        value={input}
                        placeholder="Paste your text here..."
                        onChange={(val) => setInput(val || "")}
                        onMount={handleEditorMount}
                    />
                </div>
            </div>
        </div>
    );
}
