"use client";
/*
  Website: FoX Dev Tools - Tools for Developers
  Author: Rahul Khedekar
  Copyright © 2026 FoX Dev Tools. All rights reserved.

  This code is proprietary and may not be copied, modified,
  or distributed without permission.
*/

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Trash2, FileText, AlertCircle, File, Archive, Copy } from "lucide-react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function Base64EncoderDecoderPage() {
    const [plainText, setPlainText] = useState<string>("");
    const [base64Text, setBase64Text] = useState<string>("");
    const [isUrlSafe, setIsUrlSafe] = useState<boolean>(false);
    const [mode, setMode] = useState<"auto" | "encode" | "decode">("auto");
    const [detectedType, setDetectedType] = useState<"text" | "base64" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{ plainChars: number; plainBytes: number; base64Chars: number; base64Bytes: number }>({
        plainChars: 0,
        plainBytes: 0,
        base64Chars: 0,
        base64Bytes: 0,
    });
    const [detectedFile, setDetectedFile] = useState<{ type: string; mime: string; extension: string; size: number } | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [downloadBase64, setDownloadBase64] = useState<string>("");

    const processPlainTextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const processBase64TimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (processPlainTextTimeoutRef.current) clearTimeout(processPlainTextTimeoutRef.current);
            if (processBase64TimeoutRef.current) clearTimeout(processBase64TimeoutRef.current);
        };
    }, []);

    const detectFileType = useCallback((binaryData: Uint8Array): { type: string; mime: string; extension: string } | null => {
        const bytes = Array.from(binaryData);
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return { type: "PNG Image", mime: "image/png", extension: "png" };
        if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return { type: "JPEG Image", mime: "image/jpeg", extension: "jpg" };
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return { type: "GIF Image", mime: "image/gif", extension: "gif" };
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return { type: "WebP Image", mime: "image/webp", extension: "webp" };
        if (bytes[0] === 0x42 && bytes[1] === 0x4D) return { type: "BMP Image", mime: "image/bmp", extension: "bmp" };
        if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) return { type: "ICO Image", mime: "image/x-icon", extension: "ico" };
        if (bytes[0] === 0x89 && bytes[1] === 0x41 && bytes[2] === 0x53 && bytes[3] === 0x43) return { type: "SVGZ (Compressed SVG)", mime: "image/svg+xml", extension: "svgz" };
        if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return { type: "PDF Document", mime: "application/pdf", extension: "pdf" };
        if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2D) return { type: "PDF Document", mime: "application/pdf", extension: "pdf" };
        if (bytes[0] === 0x50 && bytes[1] === 0x4B && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)) return { type: "ZIP Archive", mime: "application/zip", extension: "zip" };
        if (bytes[0] === 0x1F && bytes[1] === 0x8B) return { type: "GZIP Archive", mime: "application/gzip", extension: "gz" };
        if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21) return { type: "RAR Archive", mime: "application/vnd.rar", extension: "rar" };
        if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) return { type: "ELF Executable", mime: "application/x-executable", extension: "elf" };
        return null;
    }, []);

    const isBinaryData = useCallback((data: Uint8Array): boolean => {
        const length = Math.min(data.length, 1024);
        for (let i = 0; i < length; i++) {
            const byte = data[i];
            if (byte === 0x00) return true;
            if (byte < 0x08 || (byte > 0x0D && byte < 0x20)) return true;
            if (byte === 0x7F) return true;
        }
        return false;
    }, []);

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const encode = useCallback((text: string, urlSafe: boolean) => {
        try {
            if (!text) {
                setBase64Text("");
                setStats({ plainChars: 0, plainBytes: 0, base64Chars: 0, base64Bytes: 0 });
                setDetectedFile(null);
                return;
            }
            let encoded = btoa(unescape(encodeURIComponent(text)));
            if (urlSafe) {
                encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            }
            setBase64Text(encoded);

            const plainBytes = new Blob([text]).size;
            const base64Bytes = new Blob([encoded]).size;
            setStats({
                plainChars: text.length,
                plainBytes,
                base64Chars: encoded.length,
                base64Bytes,
            });
            setError(null);
        } catch (e) {
            setError("Encoding failed: " + (e instanceof Error ? e.message : String(e)));
        }
    }, []);

    const decode = useCallback((base64: string, urlSafe: boolean) => {
        try {
            if (!base64) {
                setPlainText("");
                setStats({ plainChars: 0, plainBytes: 0, base64Chars: 0, base64Bytes: 0 });
                setDetectedFile(null);
                setDetectedType(null);
                setError(null);
                return;
            }

            let toDecode = base64;
            if (urlSafe) {
                toDecode = toDecode.replace(/-/g, "+").replace(/_/g, "/");
            }
            while (toDecode.length % 4) toDecode += "=";

            const binaryString = atob(toDecode);
            const binaryData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                binaryData[i] = binaryString.charCodeAt(i);
            }

            const fileType = detectFileType(binaryData);
            let decodedText = "";

            if (fileType || isBinaryData(binaryData)) {
                if (fileType) {
                    setDetectedFile({ ...fileType, size: binaryData.length });
                    decodedText = `[Binary Data Detected: ${fileType.type}]`;
                } else {
                    setDetectedFile({ type: "Unknown Binary", mime: "application/octet-stream", extension: "bin", size: binaryData.length });
                    decodedText = `[Unknown Binary Data - ${binaryData.length} bytes]`;
                }
            } else {
                decodedText = new TextDecoder("utf-8").decode(binaryData);
                setDetectedFile(null);
            }

            setPlainText(decodedText);
            setDetectedType("base64");

            const base64Bytes = new Blob([base64]).size;
            setStats({
                plainChars: decodedText.length,
                plainBytes: new Blob([decodedText]).size,
                base64Chars: base64.length,
                base64Bytes,
            });
            setError(null);
        } catch (e: any) {
            if (e?.name === "InvalidCharacterError") {
                setError("Invalid Base64 string: incorrect padding or corrupted data");
            } else {
                setError("Decoding failed: " + (e?.message || String(e)));
            }
            setPlainText("");
            setDetectedFile(null);
            setDetectedType(null);
            setStats({ plainChars: 0, plainBytes: 0, base64Chars: base64.length, base64Bytes: 0 });
        }
    }, [detectFileType, isBinaryData]);

    const processPlainText = useCallback((input: string) => {
        if (!input || input.trim().length === 0) {
            setPlainText(""); setBase64Text(""); setStats({ plainChars: 0, plainBytes: 0, base64Chars: 0, base64Bytes: 0 });
            setDetectedFile(null); setDetectedType(null); setError(null); setImagePreview(""); setImageDimensions(null); return;
        }

        let trimmed = input.trim();
        if (trimmed.startsWith('data:')) {
            const commaIndex = trimmed.indexOf(',');
            if (commaIndex > 0) trimmed = trimmed.substring(commaIndex + 1);
        }

        const base64Only = trimmed.replace(/\s+/g, '');
        const base64Regex = /^[A-Za-z0-9+/=\-_]+$/;
        const hasPadding = base64Only.includes('=');
        const isLongEnough = base64Only.length > 20;

        if (base64Regex.test(base64Only) && (hasPadding || isLongEnough)) {
            let toDecode = base64Only;
            if (isUrlSafe) toDecode = toDecode.replace(/-/g, "+").replace(/_/g, "/");
            while (toDecode.length % 4) toDecode += "=";

            try {
                const binaryString = atob(toDecode);
                const binaryData = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) binaryData[i] = binaryString.charCodeAt(i);

                const fileType = detectFileType(binaryData);
                if (fileType && fileType.type.includes("Image")) {
                    const dataUri = `data:${fileType.mime};base64,${base64Only}`;
                    setImagePreview(dataUri);
                    setImageDimensions(null);

                    const img = new Image();
                    img.onload = () => setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                    img.src = dataUri;

                    setDetectedFile({ ...fileType, size: binaryData.length });
                    setPlainText(trimmed); setBase64Text(""); setDownloadBase64(base64Only); setDetectedType("base64");
                    setStats({ plainChars: trimmed.length, plainBytes: new Blob([base64Only]).size, base64Chars: 0, base64Bytes: 0 });
                    setError(null); return;
                }

                let decodedText = "";
                if (fileType) {
                    setDetectedFile({ ...fileType, size: binaryData.length });
                    decodedText = `[${fileType.type}]`; setImagePreview(""); setDownloadBase64(base64Only);
                } else {
                    try {
                        decodedText = new TextDecoder("utf-8").decode(binaryData);
                        if (decodedText.startsWith('%PDF-') || decodedText.includes('%PDF-')) {
                            setDetectedFile({ type: "PDF Document", mime: "application/pdf", extension: "pdf", size: binaryData.length });
                            decodedText = `[PDF Document]`; setImagePreview(""); setDownloadBase64(base64Only);
                        } else if (decodedText.includes('word/') || decodedText.includes('[Content_Types].xml')) {
                            setDetectedFile({ type: "Word Document", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx", size: binaryData.length });
                            decodedText = `[Word Document]`; setImagePreview(""); setDownloadBase64(base64Only);
                        } else if (decodedText.includes('xl/') || decodedText.includes('workbook.xml')) {
                            setDetectedFile({ type: "Excel Spreadsheet", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx", size: binaryData.length });
                            decodedText = `[Excel Spreadsheet]`; setImagePreview(""); setDownloadBase64(base64Only);
                        } else if (decodedText.includes('ppt/')) {
                            setDetectedFile({ type: "PowerPoint Presentation", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: "pptx", size: binaryData.length });
                            decodedText = `[PowerPoint Presentation]`; setImagePreview(""); setDownloadBase64(base64Only);
                        } else if (decodedText.startsWith('PK') || binaryData[0] === 0x50 && binaryData[1] === 0x4B) {
                            setDetectedFile({ type: "ZIP Archive", mime: "application/zip", extension: "zip", size: binaryData.length });
                            decodedText = `[ZIP Archive]`; setImagePreview(""); setDownloadBase64(base64Only);
                        } else if (isBinaryData(binaryData)) {
                            setDetectedFile({ type: "Unknown Binary", mime: "application/octet-stream", extension: "bin", size: binaryData.length });
                            decodedText = `[Binary Data - ${binaryData.length} bytes]`; setImagePreview(""); setDownloadBase64(base64Only);
                        } else {
                            setDetectedFile(null); setDownloadBase64(""); setImagePreview("");
                        }
                    } catch (e) {
                        setDetectedFile({ type: "Unknown Binary", mime: "application/octet-stream", extension: "bin", size: binaryData.length });
                        decodedText = `[Binary Data - ${binaryData.length} bytes]`; setDownloadBase64(base64Only); setImagePreview("");
                    }
                }

                setPlainText(trimmed); setBase64Text(decodedText); setDetectedType("base64"); setError(null); return;
            } catch (e) { }
        }
        setDetectedType("text"); setDetectedFile(null); encode(input, isUrlSafe);
    }, [isUrlSafe, encode, detectFileType, isBinaryData]);

    const processBase64 = useCallback((input: string) => {
        if (!input || input.trim().length === 0) {
            setPlainText(""); setBase64Text(""); setStats({ plainChars: 0, plainBytes: 0, base64Chars: 0, base64Bytes: 0 });
            setDetectedFile(null); setDetectedType(null); setError(null); setImagePreview(""); setImageDimensions(null); return;
        }

        const base64Only = input.trim().replace(/\s+/g, '');
        let toDecode = base64Only;
        if (isUrlSafe) toDecode = toDecode.replace(/-/g, "+").replace(/_/g, "/");
        while (toDecode.length % 4) toDecode += "=";

        try {
            const binaryString = atob(toDecode);
            const binaryData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) binaryData[i] = binaryString.charCodeAt(i);

            const fileType = detectFileType(binaryData);
            if (fileType && fileType.type.includes("Image")) {
                const dataUri = `data:${fileType.mime};base64,${base64Only}`;
                setImagePreview(dataUri); setImageDimensions(null);
                const img = new Image();
                img.onload = () => setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                img.src = dataUri;

                setDetectedFile({ ...fileType, size: binaryData.length });
                setBase64Text(input.trim()); setPlainText(""); setDetectedType("base64");
                setStats({ plainChars: 0, plainBytes: 0, base64Chars: input.trim().length, base64Bytes: new Blob([base64Only]).size });
                setError(null); return;
            }

            let decodedText = "";
            if (fileType) {
                setDetectedFile({ ...fileType, size: binaryData.length });
                decodedText = `[Binary Data Detected: ${fileType.type}]`; setImagePreview(""); setImageDimensions(null);
            } else if (isBinaryData(binaryData)) {
                setDetectedFile({ type: "Unknown Binary", mime: "application/octet-stream", extension: "bin", size: binaryData.length });
                decodedText = `[Unknown Binary Data - ${binaryData.length} bytes]`; setImagePreview(""); setImageDimensions(null);
            } else {
                try { decodedText = new TextDecoder("utf-8").decode(binaryData); setDetectedFile(null); setImagePreview(""); }
                catch (e) { decodedText = decodeURIComponent(escape(binaryString)); setDetectedFile(null); setImagePreview(""); }
            }

            setBase64Text(input); setPlainText(decodedText); setDetectedType("base64");
            setStats({ plainChars: decodedText.length, plainBytes: new Blob([decodedText]).size, base64Chars: input.length, base64Bytes: new Blob([input]).size });
            setError(null);
        } catch (e) {
            setBase64Text(input); setPlainText(""); setDetectedType(null); setDetectedFile(null);
            if (input.length >= 4) setError("Invalid Base64"); else setError(null);
        }
    }, [isUrlSafe, detectFileType, isBinaryData]);

    const handlePlainTextChange = (val: string | undefined) => {
        const text = val || "";
        if (processPlainTextTimeoutRef.current) clearTimeout(processPlainTextTimeoutRef.current);
        if (mode === "auto") {
            setPlainText(text);
            processPlainTextTimeoutRef.current = setTimeout(() => processPlainText(text), text.length > 1000 ? 150 : 50);
        } else if (mode === "encode") {
            setPlainText(text); encode(text, isUrlSafe);
        } else if (mode === "decode") {
            setBase64Text(text); decode(text, isUrlSafe);
        }
    };

    const handleBase64Change = (val: string | undefined) => {
        const base64 = val || "";
        if (processBase64TimeoutRef.current) clearTimeout(processBase64TimeoutRef.current);
        if (mode === "auto") {
            setBase64Text(base64);
            processBase64TimeoutRef.current = setTimeout(() => processBase64(base64), base64.length > 1000 ? 150 : 50);
        } else if (mode === "decode") {
            setBase64Text(base64); decode(base64, isUrlSafe);
        } else if (mode === "encode") {
            setPlainText(base64); encode(base64, isUrlSafe);
        }
    };

    const handleModeChange = (newMode: "auto" | "encode" | "decode") => {
        setMode(newMode);
        if (newMode === "auto") {
            if (plainText) processPlainText(plainText);
            else if (base64Text) processBase64(base64Text);
        } else if (newMode === "encode") encode(plainText, isUrlSafe);
        else if (newMode === "decode") decode(base64Text, isUrlSafe);
    };

    const handleUrlSafeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsUrlSafe(checked);
        if (mode === "auto") {
            if (plainText) processPlainText(plainText);
            else if (base64Text) processBase64(base64Text);
        } else if (mode === "encode") encode(plainText, checked);
        else if (mode === "decode") decode(base64Text, checked);
    };

    const handleDownload = () => {
        let base64Only = downloadBase64;
        if (!base64Only) base64Only = (base64Text || plainText).replace(/[^A-Za-z0-9+/=_\-]/g, '');
        if (!base64Only || base64Only.length < 4) { setError("Download failed: Invalid Base64 data"); return; }
        try {
            let toDecode = base64Only;
            if (isUrlSafe) toDecode = toDecode.replace(/-/g, "+").replace(/_/g, "/");
            while (toDecode.length % 4) toDecode += "=";
            const binaryString = atob(toDecode);
            const binaryData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) binaryData[i] = binaryString.charCodeAt(i);
            const mime = detectedFile?.mime || "application/octet-stream";
            const extension = detectedFile?.extension || "bin";
            const blob = new Blob([binaryData], { type: mime });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url; link.download = `downloaded-file.${extension}`;
            document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
        } catch (e: any) { setError("Download failed: " + (e?.message || String(e))); }
    };

    const handleClear = () => {
        setPlainText(""); setBase64Text(""); setError(null); setDetectedFile(null); setDetectedType(null); setImagePreview(""); setImageDimensions(null); setDownloadBase64("");
    };

    const loadSample = () => {
        const sample = "Hello FoX Dev Tools! 🦊\nBase64 is awesome.";
        setImagePreview(""); setImageDimensions(null); setDownloadBase64(""); setDetectedFile(null);
        if (mode === "decode") {
            const sampleBase64 = btoa(unescape(encodeURIComponent(sample)));
            setBase64Text(sampleBase64); setPlainText(""); decode(sampleBase64, isUrlSafe);
        } else {
            setPlainText(sample); encode(sample, isUrlSafe);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader toolName="Base64 Encoder / Decoder" toolColor={getToolColor("Base64 Encoder / Decoder")} description="Encode text to Base64 or decode it back in real-time. Supports binary files, images, PDF, ZIP, and more." />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex rounded-md border shadow-sm overflow-hidden">
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium border-r transition-colors ${mode === 'auto' ? 'bg-muted' : 'bg-background hover:bg-muted/50'}`} onClick={() => handleModeChange("auto")}>Auto</button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium border-r transition-colors ${mode === 'encode' ? 'bg-muted' : 'bg-background hover:bg-muted/50'}`} onClick={() => handleModeChange("encode")}>Encode</button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'decode' ? 'bg-muted' : 'bg-background hover:bg-muted/50'}`} onClick={() => handleModeChange("decode")}>Decode</button>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1 opacity-50" />

                <div className="flex items-center space-x-2 border rounded-md px-3 py-1 bg-background">
                    <Switch checked={isUrlSafe} onCheckedChange={(checked) => handleUrlSafeToggle({ target: { checked } } as any)} id="url-safe-switch" />
                    <Label htmlFor="url-safe-switch" className="text-xs font-medium text-muted-foreground cursor-pointer">URL Safe</Label>
                </div>



                <div className="flex-1" />

                {mode === "auto" && detectedType && (plainText || base64Text) && (
                    <div className="text-xs font-medium bg-muted/50 px-3 py-1.5 rounded-md border">
                        <span className="text-muted-foreground mr-1">Detected:</span>
                        <span className="font-semibold">{detectedType === "base64" ? "Base64" : "Text"}</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className="font-semibold">{detectedFile ? detectedFile.type : detectedType === "base64" ? "Text" : "Base64"}</span>
                    </div>
                )}


            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[500px]">
                {/* Left Pane - Input */}
                <div className="flex-1 min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            <span>{mode === "auto" ? "Input" : mode === "encode" ? "Plain Text" : "Base64 String"}</span>
                            {(plainText || base64Text) && (
                                <div className="flex items-center gap-2 text-[10px] lowercase tracking-normal ml-3">
                                    <span className="font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border">{stats.plainChars} chars</span>
                                    <span className="font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border">{formatSize(stats.plainBytes)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                            {(mode === "auto" ? plainText : mode === "decode" ? base64Text : plainText) && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />

                                    <CopyButton textToCopy={mode === "auto" ? plainText : mode === "decode" ? base64Text : plainText} tooltipText="Copy Input" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Input" onClickAction={() => {
                                                const text = mode === "auto" ? plainText : mode === "decode" ? base64Text : plainText;
                                                const blob = new Blob([text], { type: "text/plain" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "input.txt"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={handleClear} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            value={mode === "auto" ? plainText : mode === "decode" ? base64Text : plainText}
                            placeholder={mode === "encode" ? "Type or paste text to encode..." : mode === "decode" ? "Paste Base64 to decode..." : "Type or paste text or Base64..."}
                            onChange={mode === "auto" ? handlePlainTextChange : mode === "decode" ? handleBase64Change : handlePlainTextChange}
                            readOnly={false}
                            language="plaintext"
                        />
                    </div>
                </div>

                {/* Right Pane - Output */}
                <div className="flex-1 min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            <span>{mode === "auto" ? "Output" : mode === "encode" ? "Base64 Output" : "Decoded Result"}</span>
                            {(plainText || base64Text) && (
                                <div className="flex items-center gap-2 text-[10px] lowercase tracking-normal ml-3">
                                    <span className="font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border">{stats.base64Chars} chars</span>
                                    <span className="font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border">{formatSize(stats.base64Bytes)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {(!imagePreview && (!detectedFile || detectedFile.type === "Text" || detectedFile.type === "Unknown Binary") && (mode === "auto" ? base64Text : mode === "encode" ? base64Text : plainText)) && (
                                <>

                                    <CopyButton textToCopy={mode === "auto" ? base64Text : mode === "encode" ? base64Text : plainText} tooltipText="Copy Output" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Output" onClickAction={() => {
                                                const text = mode === "auto" ? base64Text : mode === "encode" ? base64Text : plainText;
                                                const blob = new Blob([text], { type: "text/plain" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "output.txt"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={handleClear} />
                                </>
                            )}
                        </div>
                    </div>

                    {imagePreview ? (
                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
                            <div className="rounded-lg border bg-background shadow-sm flex flex-col items-center justify-center p-6 gap-4 min-h-[250px]">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded shadow-sm border border-border/50" />
                                <AnimatedButton variant="outline" size="sm" className="border-border shadow-sm gap-1.5 h-8 px-4 text-xs rounded-md transition-all font-medium flex items-center" icon={Download} label="Download" onClickAction={handleDownload} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Image Metadata</div>
                                <div className="rounded-lg border bg-background p-4 shadow-sm">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">Dimensions</div>
                                            <div className="font-medium text-sm">{imageDimensions?.width} × {imageDimensions?.height}px</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">Type</div>
                                            <div className="font-medium text-sm">{detectedFile?.mime}</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">Base64 Size</div>
                                            <div className="font-medium text-sm">{formatSize(base64Text.length)}</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">File Size</div>
                                            <div className="font-medium text-sm">{formatSize(detectedFile?.size || 0)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : detectedFile && !imagePreview ? (
                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
                            <div className="rounded-lg border bg-background shadow-sm flex flex-col items-center justify-center p-8 gap-4 min-h-[250px]">
                                {detectedFile?.type.includes("ZIP") || detectedFile?.type.includes("Office") ? <Archive className="size-16 text-muted-foreground" /> : <FileText className="size-16 text-muted-foreground" />}
                                <div className="text-lg font-semibold">{detectedFile.type}</div>
                                <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{detectedFile.mime} • {formatSize(detectedFile.size)}</div>
                                <AnimatedButton className="mt-4 gap-2" icon={Download} label="Download" onClickAction={handleDownload} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1">
                            <Editor
                                key={`output-${base64Text.length}`}
                                value={mode === "auto" ? base64Text : mode === "encode" ? base64Text : plainText}
                                placeholder={mode === "encode" ? "Encoded Base64 will appear here..." : mode === "decode" ? "Decoded text will appear here..." : "Output will appear here..."}
                                onChange={() => { }}
                                readOnly={true}
                                language="plaintext"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
