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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Shrink, Copy, Download, Trash2, AlertCircle, FileText, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { SAMPLE_JSON_FORMATTER } from "@/lib/sampleData";
import { useToolPage } from "@/lib/hooks";
import { formatJson, minifyJson } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function FormatterPage() {
    const {
        input, setInput,
        output, setOutput,
        error,
        handleCopy, handleDownload, handleClear, handleLoadSample,
    } = useToolPage({ validateJson: true });
    const [indent, setIndent] = useState<number>(2);

    const handleFormat = () => {
        try {
            if (!input.trim()) return;
            setOutput(formatJson(input, indent));
        } catch (err) {}
    };

    const handleMinify = () => {
        try {
            if (!input.trim()) return;
            setOutput(minifyJson(input));
        } catch (err) {}
    };

    const handleSwap = () => {
        const temp = input;
        setInput(output);
        setOutput(temp);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="JSON Formatter"
                toolColor={getToolColor("JSON Formatter")}
                description="Beautify and minify JSON with customizable indentation."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" icon={Wand2} label="Format" onClickAction={handleFormat} />
                <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" icon={Shrink} label="Minify" onClickAction={handleMinify} />
                <Select value={indent.toString()} onValueChange={(val) => setIndent(Number(val))}>
                    <SelectTrigger className="w-[110px] h-8 text-xs bg-background shadow-sm">
                        <SelectValue placeholder="Indent" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2">2 Spaces</SelectItem>
                        <SelectItem value="4">4 Spaces</SelectItem>
                        <SelectItem value="8">8 Spaces</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex-1" />
                <AnimatedButton variant="outline" size="sm" className="border border-border shadow-sm gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium flex items-center" icon={ArrowRightLeft} tooltipText="Swap input ↔ output" onClickAction={handleSwap} />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            JSON Input
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={() => handleLoadSample(SAMPLE_JSON_FORMATTER)} />
                            {(input || output) && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />
                                    <CopyButton textToCopy={input} tooltipText="Copy Input" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Input" onClickAction={() => {
                                                const blob = new Blob([input], { type: "application/json" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "input.json"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Input" onClickAction={() => handleClear()} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={input} placeholder="Paste your JSON here..." onChange={(val) => setInput(val || "")} />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Formatted JSON
                        </div>
                        <div className="flex items-center gap-1">
                            {output && (
                                <>
                                    <CopyButton textToCopy={output} tooltipText="Copy JSON" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download JSON" onClickAction={() => handleDownload(undefined, "formatted.json")} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={() => handleClear()} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={output} placeholder="Formatted JSON will appear here..." onChange={(val) => setOutput(val || "")} readOnly={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
