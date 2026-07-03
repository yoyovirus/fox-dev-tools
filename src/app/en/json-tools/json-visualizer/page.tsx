/*
  Website: FoX Dev Tools - Tools for Developers
  Author: Rahul Khedekar
  Copyright © 2026 FoX Dev Tools. All rights reserved.

  This code is proprietary and may not be copied, modified,
  or distributed without permission.
*/
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, Trash2, AlertCircle, FileText } from "lucide-react";
import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";
import { Editor } from "@/components/Editor";
import { useThemeContext } from "@/components/AppThemeProvider";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { SAMPLE_JSON_VISUALIZER } from "@/lib/sampleData";
import { useToolPage } from "@/lib/hooks";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function VisualizerPage() {
    const { mode } = useThemeContext();

    const {
        input, setInput,
        error,
        handleCopy, handleDownload,
    } = useToolPage({ validateJson: true });

    let parsedJson: object | null = null;
    try {
        parsedJson = JSON.parse(input);
    } catch (e) {
        parsedJson = null;
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="JSON Visualizer"
                toolColor={getToolColor("JSON Visualizer")}
                description="Explore JSON structures in an interactive, collapsible tree view."
            />



            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>Invalid JSON: {error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        JSON Input
                    </div>
                    <div className="flex items-center gap-1">
                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={() => setInput(SAMPLE_JSON_VISUALIZER)} />
                        {input && (
                            <>
                                <Separator orientation="vertical" className="h-4 mx-1" />
                                <CopyButton textToCopy={input} tooltipText="Copy JSON" />
                                <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download JSON" onClickAction={() => handleDownload(undefined, "json-visualizer.json")} />
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => setInput("")} />
                            </>
                        )}
                    </div>
                </div>
                    <div className="flex-1">
                        <Editor
                            value={input}
                            placeholder="Paste your JSON here..."
                            onChange={(val) => setInput(val || "")}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Tree View
                        </div>
                        <div className="flex items-center gap-1">
                            {parsedJson && (
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={() => setInput("")} />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-3">
                        {parsedJson ? (
                            <JsonView
                                value={parsedJson}
                                displayDataTypes={false}
                                style={mode === "dark" ? (darkTheme as React.CSSProperties) : undefined}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                Enter valid JSON to see the tree view
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
