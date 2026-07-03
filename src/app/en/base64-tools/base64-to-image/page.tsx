"use client";
/*
  Website: FoX Dev Tools - Tools for Developers
  Author: Rahul Khedekar
  Copyright © 2026 FoX Dev Tools. All rights reserved.

  This code is proprietary and may not be copied, modified,
  or distributed without permission.
*/

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, Trash2, FileText, AlertCircle } from "lucide-react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function Base64ToImagePage() {
    const [input, setInput] = useState<string>("");
    const [imageSrc, setImageSrc] = useState<string>("");
    const [metadata, setMetadata] = useState<{ width: number; height: number; size: number; mime: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!input.trim()) {
            setImageSrc("");
            setMetadata(null);
            setError(null);
            return;
        }

        let dataUri = input.trim();
        // If it's just raw base64, try to prepend a generic data URI header
        if (!dataUri.startsWith("data:")) {
            dataUri = `data:image/png;base64,${dataUri}`;
        }

        const img = new Image();
        img.onload = () => {
            setImageSrc(dataUri);
            setError(null);

            // Calculate approximate size from base64
            const base64Body = dataUri.split(",")[1] || "";
            const size = Math.floor((base64Body.length * 3) / 4);
            const mime = dataUri.split(";")[0].split(":")[1] || "image/unknown";

            setMetadata({
                width: img.naturalWidth,
                height: img.naturalHeight,
                size,
                mime
            });
        };
        img.onerror = () => {
            if (!input.trim().startsWith("data:")) {
                setError("Invalid Base64 string or unsupported image format. Please include the Data URI header (e.g., data:image/png;base64,...).");
            } else {
                setError("Could not decode image. Please check if the Base64 string is valid and correctly formatted.");
            }
            setImageSrc("");
            setMetadata(null);
        };
        img.src = dataUri;
    }, [input]);

    const handleDownload = () => {
        if (!imageSrc) return;
        const link = document.createElement("a");
        link.href = imageSrc;
        link.download = `decoded-image.${metadata?.mime.split("/")[1] || "png"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    const loadSample = async () => {
        try {
            const response = await fetch('/foxdevtools_logo.png');
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setInput(base64);
            };
            reader.readAsDataURL(blob);
        } catch (e) {
            setError("Failed to load sample image");
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Base64 to Image"
                toolColor={getToolColor("Base64 to Image")}
                description="Decode Base64 strings or Data URIs back into images and view their properties."
            />


            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[500px]">
                {/* Input Section */}
                <div className="flex-[40] min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm h-full">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Base64 / Data URI Input
                            {input && (
                                <Badge variant="outline" className="font-mono bg-background text-muted-foreground ml-3 h-5 px-1.5 text-[10px] rounded-sm lowercase">
                                    {formatSize(input.length)}
                                </Badge>
                            )}
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
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Input" onClickAction={() => setInput("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            value={input}
                            placeholder="Paste your Base64 string or Data URI here..."
                            onChange={(val) => setInput(val || "")}
                            language="plaintext"
                        />
                    </div>
                </div>

                {/* Preview Section */}
                <div className="flex-[60] min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm h-full bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Image Preview
                        </div>
                        <div className="flex items-center gap-1">
                            {imageSrc && (
                                <>
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Image" onClickAction={handleDownload} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={() => setInput("")} />
                                </>
                            )}
                        </div>
                    </div>

                    {imageSrc ? (
                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
                            <div className="flex-1 border border-border/50 rounded-lg bg-background shadow-sm flex items-center justify-center p-4 min-h-[200px]">
                                <img src={imageSrc} alt="Decoded Preview" className="max-w-full max-h-[400px] object-contain rounded shadow-sm" />
                            </div>

                            {/* Metadata Card */}
                            {metadata && (
                                <div className="flex flex-col gap-2">
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Metadata</div>
                                    <div className="rounded-lg border bg-background p-4 shadow-sm">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] uppercase text-muted-foreground">Dimensions</div>
                                                <div className="font-medium text-sm">{metadata.width} × {metadata.height}px</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] uppercase text-muted-foreground">Type</div>
                                                <div className="font-medium text-sm">{metadata.mime}</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] uppercase text-muted-foreground">Base64 Size</div>
                                                <div className="font-medium text-sm">{formatSize(input.length)}</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] uppercase text-muted-foreground">Original Size</div>
                                                <div className="font-medium text-sm">{formatSize(metadata.size)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground bg-muted/10">
                            Decoded image will appear here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
