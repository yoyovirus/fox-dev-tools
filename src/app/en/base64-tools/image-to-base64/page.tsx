"use client";
/*
  Website: FoX Dev Tools - Tools for Developers
  Author: Rahul Khedekar
  Copyright © 2026 FoX Dev Tools. All rights reserved.

  This code is proprietary and may not be copied, modified,
  or distributed without permission.
*/

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, FileText, Upload, Download } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function ImageToBase64Page() {
    const [file, setFile] = useState<File | null>(null);
    const [base64, setBase64] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [filename, setFilename] = useState<string>("");
    const [filesize, setFilesize] = useState<number>(0);
    const [mimeType, setMimeType] = useState<string>("");
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        setFilename(selectedFile.name);
        setFilesize(selectedFile.size);
        setMimeType(selectedFile.type);

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setBase64(result);
            if (selectedFile.type.startsWith("image/")) {
                setPreviewUrl(result);

                const img = new Image();
                img.onload = () => {
                    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                };
                img.src = result;
            } else {
                setPreviewUrl("");
                setDimensions(null);
            }
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    const handleClear = () => {
        setFile(null);
        setBase64("");
        setPreviewUrl("");
        setFilename("");
        setFilesize(0);
        setMimeType("");
        setDimensions(null);
    };

    const processSample = async () => {
        try {
            const response = await fetch('/foxdevtools_logo.png');
            const blob = await response.blob();
            const file = new File([blob], 'foxdevtools_logo.png', { type: 'image/png' });

            setFile(file);
            setFilename('foxdevtools_logo.png');
            setFilesize(file.size);
            setMimeType('image/png');

            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setBase64(result);
                setPreviewUrl(result);

                const img = new Image();
                img.onload = () => {
                    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        } catch (e) {
            console.error("Failed to load sample image");
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getRawBase64 = () => {
        const parts = base64.split(",");
        return parts.length > 1 ? parts[1] : "";
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Image to Base64"
                toolColor={getToolColor("Image to Base64")}
                description="Convert image files into Base64 strings for CSS, HTML, or data transfer."
            />

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[500px]">
                {/* Upload Section */}
                <div className="flex-[40] min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm h-full bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Image Input
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={processSample} />
                            {file && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={handleClear} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col gap-6 overflow-auto bg-muted/10">
                        {/* Dropzone */}
                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-background hover:bg-muted/50 transition-colors cursor-pointer p-6 min-h-[250px] group">
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[200px] object-contain rounded shadow-sm border border-border/50 group-hover:opacity-50 transition-opacity" />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="bg-primary/10 p-4 rounded-full">
                                        <Upload className="size-8 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg">Click or Drag Image Here</div>
                                        <div className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WEBP, GIF</div>
                                    </div>
                                </div>
                            )}

                            {previewUrl && (
                                <div className="absolute font-semibold bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    <Upload className="size-4" /> Change Image
                                </div>
                            )}
                        </label>

                        {/* File Details */}
                        {file && (
                            <div className="flex flex-col gap-2">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">File Info & Metadata</div>
                                <div className="rounded-lg border bg-background p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <FileText className="size-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{filename}</div>
                                            <div className="text-xs text-muted-foreground">{mimeType} • {formatSize(filesize)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">Dimensions</div>
                                            <div className="font-medium text-sm">{dimensions ? `${dimensions.width} × ${dimensions.height}px` : "Calculating..."}</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">Base64 Size</div>
                                            <div className="font-medium text-sm">{formatSize(base64.length)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex-[60] min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm h-full bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Base64 Output
                        </div>
                        <div className="flex items-center gap-1">
                            {base64 && (
                                <>

                                    <CopyButton textToCopy={base64} tooltipText="Copy Base64" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Base64" onClickAction={() => {
                                                const blob = new Blob([base64], { type: "text/plain" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "base64.txt"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={handleClear} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-auto bg-muted/10">
                        {!base64 ? (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Upload an image to see the Base64 output
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 max-w-full">
                                {/* Full Data URI */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Data URI</div>

                                        <CopyButton textToCopy={base64} tooltipText="Copy" variant="outline" size="sm" className="h-7 px-2 text-xs gap-1.5" />
                                    </div>
                                    <div className="relative">
                                        <Input
                                            className="font-mono text-xs bg-background pr-12 overflow-hidden text-ellipsis h-10"
                                            value={base64}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Raw Base64 */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Raw Base64 (Body Only)</div>

                                        <CopyButton textToCopy={getRawBase64()} tooltipText="Copy" variant="outline" size="sm" className="h-7 px-2 text-xs gap-1.5" />
                                    </div>
                                    <div className="relative">
                                        <Input
                                            className="font-mono text-xs bg-background pr-12 overflow-hidden text-ellipsis h-10"
                                            value={getRawBase64()}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Snippets */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                                    {/* HTML Snippet */}
                                    <div className="flex flex-col gap-2 bg-background border rounded-lg p-4 shadow-sm">
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">HTML Snippet</div>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-muted/50 p-2 rounded text-xs font-mono text-muted-foreground truncate">
                                                &lt;img src="data:..." /&gt;
                                            </code>

                                            <CopyButton textToCopy={`<img src="${base64}" alt="${filename}" />`} tooltipText="Copy" />
                                        </div>
                                    </div>

                                    {/* CSS Snippet */}
                                    <div className="flex flex-col gap-2 bg-background border rounded-lg p-4 shadow-sm">
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">CSS Snippet</div>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-muted/50 p-2 rounded text-xs font-mono text-muted-foreground truncate">
                                                background-image: url("...");
                                            </code>

                                            <CopyButton textToCopy={`background-image: url("${base64}");`} tooltipText="Copy" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
