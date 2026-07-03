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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, Trash2, AlertCircle, FileText } from "lucide-react";
import { useState, useCallback } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { useToolPage } from "@/lib/hooks";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

const SAMPLE = "{\n  \"name\": \"Alice\",\n  \"age\": 30,\n  \"active\": true,\n  \"roles\": [\"admin\", \"editor\"],\n  \"address\": {\n    \"city\": \"New York\",\n    \"zip\": \"10001\"\n  }\n}";

export default function ValidatorPage() {
    const {
        input, setInput,
        handleCopy, handleDownload, handleClear, handleLoadSample,
    } = useToolPage();
    const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);

    const handleInputChange = useCallback((val: string | undefined) => {
        const newValue = val || "";
        setInput(newValue);
        if (!newValue.trim()) {
            setValidationResult(null);
            return;
        }
        try {
            JSON.parse(newValue);
            setValidationResult({ isValid: true, message: "Valid JSON — no syntax errors found." });
        } catch (err: any) {
            setValidationResult({ isValid: false, message: err.message || "Invalid JSON syntax" });
        }
    }, [setInput]);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="JSON Validator"
                toolColor={getToolColor("JSON Validator")}
                description="Quickly validate your JSON data to pinpoint syntax errors."
            />



            {validationResult && (
                <Alert variant={validationResult.isValid ? "default" : "destructive"}>
                    <AlertCircle className="size-4" />
                    <AlertDescription>{validationResult.message}</AlertDescription>
                </Alert>
            )}

            <div className="flex-1 min-h-0 flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                        JSON Input
                        {validationResult && (
                            <Badge variant="outline" className="font-mono bg-background text-muted-foreground ml-3 h-5 px-1.5 text-[10px] rounded-sm">
                                {validationResult.isValid ? "Valid JSON" : "Invalid JSON"}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={() => handleLoadSample(SAMPLE)} />
                        {input && (
                            <>
                                <Separator orientation="vertical" className="h-4 mx-1" />
                                <CopyButton textToCopy={input} tooltipText="Copy JSON" />
                                <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download JSON" onClickAction={() => handleDownload(undefined, "json-validator.json")} />
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => { handleClear(); setValidationResult(null); }} />
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <Editor
                        value={input}
                        placeholder="Paste your JSON here to validate..."
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );
}
