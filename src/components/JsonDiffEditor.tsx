"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { useThemeContext } from "@/components/AppThemeProvider";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface JsonDiffEditorProps {
    original: string;
    modified: string;
    originalPlaceholder?: string;
    modifiedPlaceholder?: string;
    onChangeOriginal?: (val: string) => void;
    onChangeModified?: (val: string) => void;
}

// Lazy load Monaco Diff Editor with loading state
const DiffEditor = dynamic(
    () => import('@monaco-editor/react').then(m => m.DiffEditor),
    {
        loading: () => (
            <div className="flex items-center justify-center h-full gap-2">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading diff editor...</span>
            </div>
        ),
        ssr: false,
    }
);

export function JsonDiffEditor({ original, modified, originalPlaceholder, modifiedPlaceholder, onChangeOriginal, onChangeModified }: JsonDiffEditorProps) {
    const [mounted, setMounted] = useState(false);
    const [origCursor, setOrigCursor] = useState({ line: 1, column: 1, position: 0 });
    const [modCursor, setModCursor] = useState({ line: 1, column: 1, position: 0 });
    const { mode } = useThemeContext();
    const isMobile = useMediaQuery("(max-width: 899px)");

    const originalCharCount = original.length;
    const originalLineCount = original ? original.split(/\r\n|\r|\n/).length : 0;
    const modifiedCharCount = modified.length;
    const modifiedLineCount = modified ? modified.split(/\r\n|\r|\n/).length : 0;

    const handleEditorDidMount = (editor: any) => {
        editor.updateOptions({ renderSideBySide: !isMobile });
        const origEditor = editor.getOriginalEditor();
        const modEditor = editor.getModifiedEditor();

        origEditor.onDidChangeModelContent(() => {
            if (onChangeOriginal) onChangeOriginal(origEditor.getValue());
        });
        modEditor.onDidChangeModelContent(() => {
            if (onChangeModified) onChangeModified(modEditor.getValue());
        });

        origEditor.onDidChangeCursorPosition((e: any) => {
            const position = e.position;
            const model = origEditor.getModel();
            if (model) {
                const offset = model.getOffsetAt(position);
                setOrigCursor({ line: position.lineNumber, column: position.column, position: offset });
            }
        });
        modEditor.onDidChangeCursorPosition((e: any) => {
            const position = e.position;
            const model = modEditor.getModel();
            if (model) {
                const offset = model.getOffsetAt(position);
                setModCursor({ line: position.lineNumber, column: position.column, position: offset });
            }
        });
    };

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) {
        return <div className="w-full h-full bg-muted/50 rounded-lg" />;
    }

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-border relative">
            {/* Mobile consolidated placeholder */}
            {isMobile && !original && !modified && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-muted-foreground/50 text-sm text-center w-4/5">
                    Paste original and modified JSON to see differences
                </div>
            )}

            {/* Desktop placeholders */}
            {!isMobile && originalPlaceholder && !original && (
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-muted-foreground/50 text-sm text-center">
                    {originalPlaceholder}
                </div>
            )}
            {!isMobile && modifiedPlaceholder && !modified && (
                <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-muted-foreground/50 text-sm text-center">
                    {modifiedPlaceholder}
                </div>
            )}

            <DiffEditor
                key={isMobile ? "inline" : "side-by-side"}
                height="100%"
                language="json"
                theme={mode === "dark" ? "vs-dark" : "vs-light"}
                original={original}
                modified={modified}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    lineNumbers: "on",
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    renderSideBySide: !isMobile,
                    originalEditable: true,
                    automaticLayout: true,
                    renderMarginRevertIcon: false,
                    diffWordWrap: "off",
                    ignoreTrimWhitespace: false,
                    renderOverviewRuler: false,
                    enableSplitViewResizing: false,
                    splitViewDefaultRatio: 0.5,
                }}
                loading={
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Loading diff editor...
                    </div>
                }
                onMount={handleEditorDidMount}
            />

            {/* Original status bar */}
            {original.length > 0 && (
                <div className="absolute bottom-0 right-[calc(50%+18px)] bg-card/90 backdrop-blur-sm px-3 py-1 rounded-tl-lg border-l border-t border-border flex gap-3 pointer-events-none z-10">
                    <span className="status-bar-text">ORIGINAL —</span>
                    <span className="status-bar-text">length: {originalCharCount}</span>
                    <span className="status-bar-text">lines: {originalLineCount}</span>
                    <span className="status-bar-text">Ln: {origCursor.line}</span>
                    <span className="status-bar-text">Col: {origCursor.column}</span>
                </div>
            )}

            {/* Modified status bar */}
            {modified.length > 0 && (
                <div className="status-bar">
                    <span className="status-bar-text">MODIFIED —</span>
                    <span className="status-bar-text">length: {modifiedCharCount}</span>
                    <span className="status-bar-text">lines: {modifiedLineCount}</span>
                    <span className="status-bar-text">Ln: {modCursor.line}</span>
                    <span className="status-bar-text">Col: {modCursor.column}</span>
                </div>
            )}
        </div>
    );
}
