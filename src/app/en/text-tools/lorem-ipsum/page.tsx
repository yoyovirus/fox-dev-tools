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
import { Copy, Download, Trash2, Wand2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

const LOREM_IPSUM_WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
    "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
    "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores",
    "quas", "molestias", "excepturi", "obcaecati", "cupiditate", "provident",
    "similique", "neque", "porro", "quisquam", "nihil", "impedit", "quo", "minus",
    "quod", "maxime", "placeat", "facere", "possimus", "omnis", "voluptas",
    "assumenda", "repellendus", "temporibus", "quibusdam", "aut", "perferendis",
    "doloribus", "asperiores", "repellat", "nam", "libero", "tempore", "cum",
    "soluta", "nobis", "eligendi", "optio", "cumque",
];

export default function LoremIpsumPage() {
    const [output, setOutput] = useState<string>("");
    const [paragraphs, setParagraphs] = useState<number>(3);
    const [sentencesPerParagraph, setSentencesPerParagraph] = useState<number>(5);
    const [wordsPerParagraph, setWordsPerParagraph] = useState<number>(40);
    const [startWithLorem, setStartWithLorem] = useState(true);

    useEffect(() => {
        document.title = "Lorem Ipsum - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const generateWord = () => LOREM_IPSUM_WORDS[Math.floor(Math.random() * LOREM_IPSUM_WORDS.length)];

    const generateSentence = () => {
        const words: string[] = [];
        const wordsPerSentence = Math.max(3, Math.floor(wordsPerParagraph / sentencesPerParagraph));
        for (let i = 0; i < wordsPerSentence; i++) words.push(generateWord());
        return words.join(" ") + ".";
    };

    const generateParagraph = () => {
        const sentences: string[] = [];
        for (let i = 0; i < sentencesPerParagraph; i++) sentences.push(generateSentence());
        return sentences.join(" ");
    };

    const generate = () => {
        const paragraphsArray: string[] = [];
        for (let i = 0; i < paragraphs; i++) {
            let paragraph = generateParagraph();
            if (i === 0 && startWithLorem) {
                paragraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " + paragraph;
            }
            paragraphsArray.push(paragraph);
        }
        setOutput(paragraphsArray.join("\n\n"));
    };

    useEffect(() => { generate(); }, [paragraphs, sentencesPerParagraph, startWithLorem, wordsPerParagraph]);

    const handleCopy = async () => { try { await navigator.clipboard.writeText(output); } catch {} };
    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "lorem-ipsum.txt"; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const clearOutput = () => setOutput("");

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Lorem Ipsum"
                toolColor={getToolColor("Lorem Ipsum")}
                description="Generate placeholder Lorem Ipsum text for your designs."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground mr-1">Presets:</span>
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium" icon={Wand2} label="Short" onClickAction={() => { setParagraphs(1); setSentencesPerParagraph(3); setWordsPerParagraph(30); }} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium" icon={Wand2} label="Medium" onClickAction={() => { setParagraphs(3); setSentencesPerParagraph(5); setWordsPerParagraph(50); }} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium" icon={Wand2} label="Long" onClickAction={() => { setParagraphs(5); setSentencesPerParagraph(8); setWordsPerParagraph(80); }} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium" icon={Wand2} label="Article" onClickAction={() => { setParagraphs(10); setSentencesPerParagraph(10); setWordsPerParagraph(120); }} />
                </div>
                <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">¶ {paragraphs}</span>
                    <input type="range" className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} min={1} max={20} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">S/¶ {sentencesPerParagraph}</span>
                    <input type="range" className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={sentencesPerParagraph} onChange={(e) => setSentencesPerParagraph(Number(e.target.value))} min={1} max={15} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">W/¶ {wordsPerParagraph}</span>
                    <input type="range" className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={wordsPerParagraph} onChange={(e) => setWordsPerParagraph(Number(e.target.value))} min={10} max={200} />
                </div>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary shadow-sm" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} />
                    Start with Lorem
                </label>
            </div>

            <div className="flex-1 min-h-0 flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                        Generated Lorem Ipsum
                        {output && (
                            <div className="ml-3 flex gap-2">
                                <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`${output.split(/\s+/).length} words`}</Badge>
                                <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`${output.length} chars`}</Badge>
                                <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`${paragraphs} ¶`}</Badge>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={RefreshCw} label="Generate" onClickAction={generate} />
                        {output && (
                            <>
                                <Separator orientation="vertical" className="h-4 mx-1" />
                                <CopyButton textToCopy={output} tooltipText="Copy text" />
                                <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={handleDownload} />
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={clearOutput} />
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-background">
                    <Editor value={output} onChange={() => {}} readOnly placeholder="Click Generate to create Lorem Ipsum text..." />
                </div>
            </div>
        </div>
    );
}
