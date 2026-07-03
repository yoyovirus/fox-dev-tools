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
import { Copy, Download, Trash2, FileText } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function TextStatisticsPage() {
    const [input, setInput] = useState<string>("");

    useEffect(() => {
        document.title = "Text Statistics - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const stats = useMemo(() => {
        if (!input) {
            return {
                characters: 0, charactersNoSpaces: 0, words: 0, lines: 0,
                sentences: 0, paragraphs: 0, avgWordLength: 0,
                readingTime: "0 sec", speakingTime: "0 sec",
                mostFrequentWord: "-", uniqueWords: 0,
            };
        }
        const characters = input.length;
        const charactersNoSpaces = input.replace(/\s/g, '').length;
        const words = input.trim() ? input.trim().split(/\s+/).length : 0;
        const lines = input.split('\n').length;
        const sentences = input.split(/[.!?]+/).filter(s => s.trim()).length;
        const paragraphs = input.split(/\n\s*\n/).filter(p => p.trim()).length || (input.trim() ? 1 : 0);
        const wordList = input.toLowerCase().match(/\b\w+\b/g) || [];
        const avgWordLength = words > 0 ? (wordList.reduce((acc, word) => acc + word.length, 0) / words).toFixed(2) : 0;
        const readingTimeMinutes = words / 200;
        const readingTime = readingTimeMinutes < 1 ? `${Math.ceil(readingTimeMinutes * 60)} sec` : `${Math.ceil(readingTimeMinutes)} min`;
        const speakingTimeMinutes = words / 130;
        const speakingTime = speakingTimeMinutes < 1 ? `${Math.ceil(speakingTimeMinutes * 60)} sec` : `${Math.ceil(speakingTimeMinutes)} min`;
        const wordFrequency: Record<string, number> = {};
        wordList.forEach(word => { wordFrequency[word] = (wordFrequency[word] || 0) + 1; });
        const uniqueWords = Object.keys(wordFrequency).length;
        let mostFrequentWord = "-";
        let maxCount = 0;
        Object.entries(wordFrequency).forEach(([word, count]) => {
            if (count > maxCount) { maxCount = count; mostFrequentWord = `${word} (${count})`; }
        });
        return { characters, charactersNoSpaces, words, lines, sentences, paragraphs, avgWordLength, readingTime, speakingTime, mostFrequentWord, uniqueWords };
    }, [input]);

    const handleCopy = async () => { try { await navigator.clipboard.writeText(input); } catch {} };
    const handleDownload = () => {
        if (!input) return;
        const blob = new Blob([input], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "text.txt"; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const clearEditor = () => setInput("");
    const loadSample = () => {
        setInput(`The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.
        
Pangrams are often used for font previews and keyboard testing. They're also popular in typing practice and speed tests.

How many words can you count in this text?`);
    };

    const StatCard = ({ label, value }: { label: string; value: string | number }) => (
        <div className="border border-border rounded-lg bg-card p-3 text-center min-w-[100px]">
            <div className="text-lg font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Text Statistics"
                toolColor={getToolColor("Text Statistics")}
                description="Get detailed statistics about your text including word count, characters, and more."
            />



            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 shrink-0">
                <StatCard label="Characters" value={stats.characters} />
                <StatCard label="No Spaces" value={stats.charactersNoSpaces} />
                <StatCard label="Words" value={stats.words} />
                <StatCard label="Lines" value={stats.lines} />
                <StatCard label="Sentences" value={stats.sentences} />
                <StatCard label="Paragraphs" value={stats.paragraphs} />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 shrink-0">
                <StatCard label="Avg Word Len" value={stats.avgWordLength} />
                <StatCard label="Unique Words" value={stats.uniqueWords} />
                <StatCard label="Reading Time" value={stats.readingTime} />
                <StatCard label="Speaking Time" value={stats.speakingTime} />
                <StatCard label="Most Frequent" value={stats.mostFrequentWord} />
            </div>

            <div className="flex-1 min-h-0 flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Input Text
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
                    <Editor value={input} placeholder="Paste your text here to see statistics..." onChange={(val) => setInput(val || "")} />
                </div>
            </div>
        </div>
    );
}
