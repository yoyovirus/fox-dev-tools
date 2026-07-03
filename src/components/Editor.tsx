"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { useThemeContext } from "@/components/AppThemeProvider";

interface EditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    readOnly?: boolean;
    placeholder?: string;
    onMount?: (editor: any) => void;
}

// Lazy load Monaco Editor with loading state
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react'),
    {
        loading: () => (
            <div className="flex items-center justify-center h-full gap-2">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading editor...</span>
            </div>
        ),
        ssr: false,
    }
);

export function Editor({ value, onChange, language = "json", readOnly = false, placeholder, onMount }: EditorProps) {
    const [mounted, setMounted] = useState(false);
    const [cursorPos, setCursorPos] = useState({ line: 1, column: 1, position: 0 });
    const { mode } = useThemeContext();

    const charCount = value.length;
    const lineCount = value ? value.split(/\r\n|\r|\n/).length : 0;

    const handleEditorDidMount = (editor: any) => {
        if (onMount) {
            onMount(editor);
        }
        editor.onDidChangeCursorPosition((e: any) => {
            const position = e.position;
            const model = editor.getModel();
            if (model) {
                const offset = model.getOffsetAt(position);
                setCursorPos({
                    line: position.lineNumber,
                    column: position.column,
                    position: offset
                });
            }
        });
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-full h-full bg-muted/50 rounded-lg" />;
    }

    return (
        <div className="w-full h-full relative">
            {placeholder && !value && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-muted-foreground/50 text-sm text-center">
                    {placeholder}
                </div>
            )}
            <MonacoEditor
                height="100%"
                language={language}
                theme={mode === "dark" ? "vs-dark" : "vs-light"}
                value={value}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    wrappingStrategy: "advanced",
                    lineNumbers: language === "plaintext" ? "off" : "on",
                    readOnly: readOnly,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                    automaticLayout: true,
                    scrollBeyondLastColumn: 0,
                }}
                loading={
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Loading editor...
                    </div>
                }
                onMount={handleEditorDidMount}
            />
            {value.length > 0 && (
                <div className="status-bar">
                    <span className="status-bar-text">length: {charCount}</span>
                    <span className="status-bar-text">lines: {lineCount}</span>
                    <span className="status-bar-text">Ln: {cursorPos.line}</span>
                    <span className="status-bar-text">Col: {cursorPos.column}</span>
                    <span className="status-bar-text">Pos: {cursorPos.position}</span>
                </div>
            )}
        </div>
    );
}
