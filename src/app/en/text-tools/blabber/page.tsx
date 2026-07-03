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
import { Copy, Download, Trash2, RefreshCw, Wand2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

const SYLLABLES = [
    "ba", "bo", "bi", "be", "bu", "by", "da", "do", "di", "de", "du", "dy",
    "fa", "fo", "fi", "fe", "fu", "fy", "ga", "go", "gi", "ge", "gu", "gy",
    "ha", "ho", "hi", "he", "hu", "hy", "ja", "jo", "ji", "je", "ju", "jy",
    "ka", "ko", "ki", "ke", "ku", "ky", "la", "lo", "li", "le", "lu", "ly",
    "ma", "mo", "mi", "me", "mu", "my", "na", "no", "ni", "ne", "nu", "ny",
    "pa", "po", "pi", "pe", "pu", "py", "ra", "ro", "ri", "re", "ru", "ry",
    "sa", "so", "si", "se", "su", "sy", "ta", "to", "ti", "te", "tu", "ty",
    "va", "vo", "vi", "ve", "vu", "vy", "wa", "wo", "wi", "we", "wu", "wy",
    "za", "zo", "zi", "ze", "zu", "zy", "cha", "cho", "chi", "che", "chu",
    "sha", "sho", "shi", "she", "shu", "thy", "tho", "thi", "the", "thu",
    "bla", "blo", "bli", "ble", "blu", "bra", "bro", "bri", "bre", "bru",
    "cla", "clo", "cli", "cle", "clu", "dra", "dro", "dri", "dre", "dru",
    "fla", "flo", "fli", "fle", "flu", "gra", "gro", "gri", "gre", "gru",
    "pla", "plo", "pli", "ple", "plu", "pra", "pro", "pri", "pre", "pru",
    "stra", "stro", "stri", "stre", "stru", "tra", "tro", "tri", "tre", "tru",
];
const WORD_ENDINGS = ["", "s", "ing", "ed", "er", "est", "ly", "ness", "tion", "ment"];
const SENTENCE_STARTERS = ["Blabber", "Flumox", "Quizzle", "Snarf", "Glimmer", "Zorp", "Squibble", "Frazzle"];
const CONNECTORS = ["and", "but", "or", "so", "yet", "for", "nor", "while", "whereas", "although"];

export default function BlabberPage() {
    const [output, setOutput] = useState<string>("");
    const [paragraphs, setParagraphs] = useState<number>(3);
    const [sentencesPerParagraph, setSentencesPerParagraph] = useState<number>(5);
    const [wordsPerParagraph, setWordsPerParagraph] = useState<number>(40);
    const [wordStyle, setWordStyle] = useState<"simple" | "complex" | "mixed">("simple");

    useEffect(() => {
        document.title = "Blabber - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const generateSyllables = () => {
        const count = wordStyle === "simple" ? Math.floor(Math.random() * 2) + 1 : wordStyle === "complex" ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 3) + 1;
        let word = "";
        for (let i = 0; i < count; i++) word += SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)];
        return word + WORD_ENDINGS[Math.floor(Math.random() * WORD_ENDINGS.length)];
    };

    const generateWord = () => Math.random() < 0.1 ? SENTENCE_STARTERS[Math.floor(Math.random() * SENTENCE_STARTERS.length)] : generateSyllables();

    const generateSentence = (index: number) => {
        const words: string[] = [];
        const wordsPerSentence = Math.max(3, Math.floor(wordsPerParagraph / sentencesPerParagraph));
        if (index === 0 && Math.random() < 0.5) words.push(SENTENCE_STARTERS[Math.floor(Math.random() * SENTENCE_STARTERS.length)]);
        for (let i = words.length; i < wordsPerSentence; i++) {
            if (i > 0 && Math.random() < 0.15) words.push(CONNECTORS[Math.floor(Math.random() * CONNECTORS.length)]);
            words.push(generateWord());
        }
        const sentence = words.join(" ");
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
    };

    const generate = () => {
        const paragraphsArray: string[] = [];
        for (let i = 0; i < paragraphs; i++) {
            const sentences: string[] = [];
            for (let j = 0; j < sentencesPerParagraph; j++) sentences.push(generateSentence(j));
            paragraphsArray.push(sentences.join(" "));
        }
        setOutput(paragraphsArray.join("\n\n"));
    };

    useEffect(() => { generate(); }, [paragraphs, sentencesPerParagraph, wordStyle, wordsPerParagraph]);

    const handleCopy = async () => { try { await navigator.clipboard.writeText(output); } catch {} };
    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "blabber.txt"; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const clearOutput = () => setOutput("");

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Blabber"
                toolColor={getToolColor("Blabber")}
                description="Generate random placeholder text similar to Lorem Ipsum."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex rounded-md border shadow-sm overflow-hidden">
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium border-r ${wordStyle === 'simple' ? 'bg-muted' : ''}`} onClick={() => setWordStyle('simple')}>Simple</button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium border-r ${wordStyle === 'mixed' ? 'bg-muted' : ''}`} onClick={() => setWordStyle('mixed')}>Mixed</button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium ${wordStyle === 'complex' ? 'bg-muted' : ''}`} onClick={() => setWordStyle('complex')}>Complex</button>
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
            </div>

            <div className="flex-1 min-h-0 flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                        Generated Blabber Text
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
                    <Editor value={output} onChange={() => {}} readOnly placeholder="Click Generate to create Blabber text..." />
                </div>
            </div>
        </div>
    );
}
