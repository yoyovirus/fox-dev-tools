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
import { Copy, Download, Trash2, FileText, CaseUpper, CaseLower, CaseSensitive, Text, Shuffle } from "lucide-react";
import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { useToolPage } from "@/lib/hooks";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function CaseConverterPage() {
    const { input, setInput, handleCopy, handleDownload } = useToolPage();

    useEffect(() => {
        document.title = "Case Converter - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const toUpperCase = () => setInput(input.toUpperCase());
    const toLowerCase = () => setInput(input.toLowerCase());
    const toTitleCase = () => setInput(input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
    const toSentenceCase = () => setInput(input.toLowerCase().replace(/(^\s*\w|[\.!\?]\s*\w)/g, (c) => c.toUpperCase()));
    const toCamelCase = () => setInput(input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, ''));
    const toPascalCase = () => setInput(input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, ''));
    const toSnakeCase = () => setInput(input.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('_'));
    const toKebabCase = () => setInput(input.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('-'));
    const toAlternatingCase = () => setInput(input.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join(''));
    const toInverseCase = () => setInput(input.split('').map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join(''));
    const capitalizeFirst = () => setInput(input.charAt(0).toUpperCase() + input.slice(1).toLowerCase());
    const loadSample = () => setInput("hello world this is a sample text for case conversion");

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Case Converter"
                toolColor={getToolColor("Case Converter")}
                description="Convert text between uppercase, lowercase, title case, and more."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={CaseUpper} label="UPPER" onClickAction={toUpperCase} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={CaseLower} label="lower" onClickAction={toLowerCase} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={CaseSensitive} label="Title" onClickAction={toTitleCase} />
                </div>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={Text} label="Sentence" onClickAction={toSentenceCase} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={CaseSensitive} label="camelCase" onClickAction={toCamelCase} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={CaseSensitive} label="PascalCase" onClickAction={toPascalCase} />
                </div>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={Text} label="snake_case" onClickAction={toSnakeCase} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={Text} label="kebab-case" onClickAction={toKebabCase} />
                </div>
                <div className="flex shadow-sm rounded-md overflow-hidden">
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={Shuffle} label="aLtErNaTiNg" onClickAction={toAlternatingCase} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={Shuffle} label="InVeRsE" onClickAction={toInverseCase} />
                    <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm rounded-none gap-1.5 h-8 px-3 text-xs transition-all font-medium" icon={CaseSensitive} label="Cap first" onClickAction={capitalizeFirst} />
                </div>
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
                                <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download text" onClickAction={() => handleDownload(undefined, "converted-text.txt")} />
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => setInput("")} />
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <Editor value={input} placeholder="Paste your text here and click any conversion button above..." onChange={(val) => setInput(val || "")} />
                </div>
            </div>
        </div>
    );
}
