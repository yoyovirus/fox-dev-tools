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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, Trash2, FileText, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { SAMPLE_JSON_PATH_TESTER } from "@/lib/sampleData";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";
// ── Dynamic path generator ────────────────────────────────────────────────────
interface DynamicPath { label: string; path: string; desc: string; }

function generateDynamicPaths(json: unknown): DynamicPath[] {
    if (json === null || json === undefined) return [];

    const paths: DynamicPath[] = [];
    paths.push({ label: "$", path: "$", desc: "Root object" });

    if (typeof json === "object" && !Array.isArray(json)) {
        const topKeys = Object.keys(json as Record<string, unknown>);
        if (topKeys.length === 0) return paths;

        const firstKey = topKeys[0];
        const firstVal = (json as Record<string, unknown>)[firstKey];

        paths.push({ label: `$.${firstKey}`, path: `$.${firstKey}`, desc: "Child property" });

        let arrayPath: string | null = null;
        let arrayVal: unknown[] | null = null;

        if (Array.isArray(firstVal)) {
            arrayPath = `$.${firstKey}`;
            arrayVal = firstVal as unknown[];
        } else if (firstVal && typeof firstVal === "object" && !Array.isArray(firstVal)) {
            for (const [k, v] of Object.entries(firstVal as Record<string, unknown>)) {
                if (Array.isArray(v)) {
                    arrayPath = `$.${firstKey}.${k}`;
                    arrayVal = v as unknown[];
                    if (paths.length === 2) {
                        paths.push({ label: arrayPath, path: arrayPath, desc: "Child property" });
                    }
                    break;
                }
            }
        }

        if (arrayPath && arrayVal) {
            paths.push({ label: `${arrayPath}[0]`, path: `${arrayPath}[0]`, desc: "Array index" });
            paths.push({ label: `${arrayPath}[*]`, path: `${arrayPath}[*]`, desc: "All children" });

            const firstItem = arrayVal[0];
            if (firstItem && typeof firstItem === "object" && !Array.isArray(firstItem)) {
                const itemKeys = Object.keys(firstItem as Record<string, unknown>);
                if (itemKeys.length > 0) {
                    const prop = itemKeys[0];
                    paths.push({ label: `${arrayPath}[*].${prop}`, path: `${arrayPath}[*].${prop}`, desc: "Nested path" });
                }
            }

            const keyDepths: Record<string, Set<number>> = {};
            function collectKeys(val: unknown, depth: number) {
                if (Array.isArray(val)) {
                    val.forEach(v => collectKeys(v, depth + 1));
                } else if (val && typeof val === "object") {
                    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
                        if (!keyDepths[k]) keyDepths[k] = new Set();
                        keyDepths[k].add(depth);
                        collectKeys(v, depth + 1);
                    }
                }
            }
            collectKeys(json, 0);
            const recursiveKey = Object.entries(keyDepths).find(([, depths]) => depths.size >= 2)?.[0];
            if (recursiveKey) {
                paths.push({ label: `$..${recursiveKey}`, path: `$..${recursiveKey}`, desc: "Nested path" });
            }

            if (arrayVal.length >= 2) {
                const end = Math.min(arrayVal.length, 2);
                paths.push({ label: `${arrayPath}[0:${end}]`, path: `${arrayPath}[0:${end}]`, desc: "Nested path" });
            }
        }
    } else if (Array.isArray(json)) {
        paths.push({ label: "$[0]", path: "$[0]", desc: "Array index" });
        paths.push({ label: "$[*]", path: "$[*]", desc: "All children" });
        const firstItem = (json as unknown[])[0];
        if (firstItem && typeof firstItem === "object" && !Array.isArray(firstItem)) {
            const prop = Object.keys(firstItem as Record<string, unknown>)[0];
            if (prop) paths.push({ label: `$[*].${prop}`, path: `$[*].${prop}`, desc: "Nested path" });
        }
        if ((json as unknown[]).length >= 2) {
            paths.push({ label: "$[0:2]", path: "$[0:2]", desc: "Nested path" });
        }
    }
    return paths;
}

// --- Minimal JSONPath engine (no external deps) ---
function jsonPathEval(json: unknown, path: string): { results: unknown[]; error: string | null } {
    try {
        const tokens = tokenizePath(path);
        const results = evaluate(json, tokens);
        return { results, error: null };
    } catch (e: unknown) {
        return { results: [], error: e instanceof Error ? e.message : String(e) };
    }
}

function tokenizePath(path: string): string[] {
    if (!path.startsWith("$")) throw new Error("JSONPath must start with $");
    const tokens: string[] = ["$"];
    let i = 1;
    while (i < path.length) {
        if (path[i] === ".") {
            if (path[i + 1] === ".") {
                tokens.push("..");
                i += 2;
                let seg = "";
                if (path[i] === "[") {
                    let depth = 0;
                    while (i < path.length) {
                        if (path[i] === "[") depth++;
                        if (path[i] === "]") { depth--; if (depth === 0) { seg += path[i]; i++; break; } }
                        seg += path[i++];
                    }
                    tokens.push(seg);
                } else {
                    while (i < path.length && path[i] !== "." && path[i] !== "[") seg += path[i++];
                    if (seg) tokens.push(seg);
                }
            } else {
                i++;
                let seg = "";
                while (i < path.length && path[i] !== "." && path[i] !== "[") seg += path[i++];
                if (seg && seg !== "*") tokens.push(seg);
                else if (seg === "*") tokens.push("*");
            }
        } else if (path[i] === "[") {
            let seg = "";
            let depth = 0;
            while (i < path.length) {
                if (path[i] === "[") depth++;
                if (path[i] === "]") { depth--; if (depth === 0) { seg += path[i]; i++; break; } }
                seg += path[i++];
            }
            tokens.push(seg);
        } else {
            i++;
        }
    }
    return tokens;
}

function evaluate(root: unknown, tokens: string[]): unknown[] {
    let current: unknown[] = [root];
    let i = 1;
    while (i < tokens.length) {
        const tok = tokens[i];
        if (tok === "..") {
            i++;
            const nextTok = tokens[i] || "*";
            const all = flatten(current);
            current = applyToken(all, nextTok, true);
        } else {
            current = applyToken(current, tok, false);
        }
        i++;
    }
    return current;
}

function flatten(nodes: unknown[]): unknown[] {
    const result: unknown[] = [];
    function recurse(val: unknown) {
        result.push(val);
        if (Array.isArray(val)) val.forEach(recurse);
        else if (val && typeof val === "object") Object.values(val as Record<string, unknown>).forEach(recurse);
    }
    nodes.forEach(recurse);
    return result;
}

function applyToken(nodes: unknown[], tok: string, recursive: boolean): unknown[] {
    const result: unknown[] = [];
    for (const node of nodes) {
        if (tok === "*") {
            if (Array.isArray(node)) result.push(...node);
            else if (node && typeof node === "object") result.push(...Object.values(node as Record<string, unknown>));
        } else if (tok.startsWith("[")) {
            const inner = tok.slice(1, -1).trim();
            if (inner === "*") {
                if (Array.isArray(node)) result.push(...node);
                else if (node && typeof node === "object") result.push(...Object.values(node as Record<string, unknown>));
            } else if (inner.startsWith("?(")) {
                const expr = inner.slice(2, -1).trim();
                if (Array.isArray(node)) {
                    for (const item of node) {
                        if (evalFilter(item, expr)) result.push(item);
                    }
                }
            } else if (inner.includes(",")) {
                const parts = inner.split(",").map(s => s.trim());
                if (Array.isArray(node)) {
                    for (const p of parts) {
                        const idx = parseInt(p, 10);
                        if (!isNaN(idx) && node[idx] !== undefined) result.push(node[idx]);
                    }
                }
            } else if (inner.includes(":")) {
                const parts = inner.split(":").map(s => s.trim());
                if (Array.isArray(node)) {
                    const start = parts[0] ? parseInt(parts[0], 10) : 0;
                    const end = parts[1] ? parseInt(parts[1], 10) : node.length;
                    result.push(...node.slice(start < 0 ? node.length + start : start, end < 0 ? node.length + end : end));
                }
            } else {
                const idx = parseInt(inner, 10);
                if (!isNaN(idx)) {
                    if (Array.isArray(node) && node[idx] !== undefined) result.push(node[idx]);
                } else {
                    const key = inner.replace(/^['"]|['"]$/g, "");
                    if (node && typeof node === "object" && !Array.isArray(node)) {
                        const val = (node as Record<string, unknown>)[key];
                        if (val !== undefined) result.push(val);
                    }
                }
            }
        } else {
            if (node && typeof node === "object" && !Array.isArray(node)) {
                const val = (node as Record<string, unknown>)[tok];
                if (val !== undefined) result.push(val);
            } else if (recursive && Array.isArray(node)) {
                for (const item of node) {
                    if (item && typeof item === "object" && !Array.isArray(item)) {
                        const val = (item as Record<string, unknown>)[tok];
                        if (val !== undefined) result.push(val);
                    }
                }
            }
        }
    }
    return result;
}

function evalFilter(item: unknown, expr: string): boolean {
    try {
        const m = expr.match(/^@\.(\w+)\s*(==|!=|<|>|<=|>=)\s*(['"]?)(.+)\3$/);
        if (m) {
            const prop = m[1];
            const op = m[2];
            const raw = m[4];
            const valStr = raw;
            const itemVal = (item as Record<string, unknown>)[prop];
            const numVal = parseFloat(valStr);
            const compareVal = !isNaN(numVal) ? numVal : valStr;
            if (op === "==") return itemVal == compareVal;
            if (op === "!=") return itemVal != compareVal;
            if (op === "<") return (itemVal as number) < (compareVal as number);
            if (op === ">") return (itemVal as number) > (compareVal as number);
            if (op === "<=") return (itemVal as number) <= (compareVal as number);
            if (op === ">=") return (itemVal as number) >= (compareVal as number);
        }
        const existence = expr.match(/^@\.(\w+)$/);
        if (existence) {
            return item != null && typeof item === "object" && existence[1] in (item as object);
        }
    } catch { /* ignore */ }
    return false;
}

export default function JsonPathTesterPage() {
    const [input, setInput] = useState<string>("");
    const [pathExpr, setPathExpr] = useState<string>("$.");
    const [results, setResults] = useState<unknown[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [pathError, setPathError] = useState<string | null>(null);

    const dynamicPaths = useMemo<DynamicPath[]>(() => {
        if (!input.trim()) return [];
        try {
            return generateDynamicPaths(JSON.parse(input));
        } catch {
            return [];
        }
    }, [input]);

    const runQuery = useCallback(() => {
        if (!input.trim()) { setResults([]); setPathError(null); return; }
        let parsed: unknown;
        try {
            parsed = JSON.parse(input);
            setParseError(null);
        } catch (e: unknown) {
            setParseError(e instanceof Error ? e.message : String(e));
            setResults([]);
            return;
        }
        if (!pathExpr.trim() || pathExpr === "$.") { setResults([]); setPathError(null); return; }
        const { results: r, error } = jsonPathEval(parsed, pathExpr);
        setPathError(error);
        setResults(error ? [] : r);
    }, [input, pathExpr]);

    useEffect(() => { runQuery(); }, [runQuery]);

    const handleCopyResults = async () => {
        const text = JSON.stringify(results, null, 2);
        await navigator.clipboard.writeText(text);
    };

    const handleDownloadResults = () => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "jsonpath-results.json";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const loadSample = () => {
        setInput(SAMPLE_JSON_PATH_TESTER);
        setPathExpr("$.store.book[*].author");
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="JSON Path Tester"
                toolColor={getToolColor("JSON Path Tester")}
                description="Test JSONPath expressions against your JSON data and see matched values instantly."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <Input
                    className="w-[300px] h-8 text-xs bg-background"
                    value={pathExpr}
                    onChange={e => setPathExpr(e.target.value)}
                    placeholder="e.g. $.store.book[*].author"
                />
            </div>

            {parseError && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>Invalid JSON: {parseError}</AlertDescription>
                </Alert>
            )}

            {pathError && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>Invalid JSONPath: {pathError}</AlertDescription>
                </Alert>
            )}

            {dynamicPaths.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {dynamicPaths.map((ex, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="outline"
                                    className="font-mono bg-muted/50 text-muted-foreground whitespace-nowrap cursor-pointer hover:bg-muted"
                                    onClick={() => setPathExpr(ex.path)}
                                >
                                    {ex.label}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{ex.desc}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            JSON Input
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                            {(input || pathExpr !== "$.") && (
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
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear All" onClickAction={() => { setInput(""); setPathExpr("$."); setResults([]); }} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor language="json" value={input} placeholder="Paste your JSON here..." onChange={val => setInput(val || "")} />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Results
                            {results.length > 0 && (
                                <Badge variant="outline" className="font-mono bg-background text-muted-foreground ml-3 h-5 px-1.5 text-[10px] rounded-sm">{`${results.length} match${results.length !== 1 ? "es" : ""}`}</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {results.length > 0 && (
                                <>
                                    <CopyButton textToCopy={JSON.stringify(results, null, 2)} tooltipText="Copy results" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download results" onClickAction={handleDownloadResults} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={() => { setInput(""); setPathExpr("$."); setResults([]); }} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-muted/10 p-4">
                        {results.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                {!input.trim() ? "Enter JSON and a JSONPath expression to query." : "No results. Try a different expression."}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {results.map((r, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Match {idx + 1}</div>
                                        <div className="border border-border rounded-md bg-background p-3 shadow-sm font-mono text-sm overflow-auto max-h-[300px]">
                                            {typeof r === "string" ? `"${r}"` : typeof r === "number" || typeof r === "boolean" ? String(r) : <pre>{JSON.stringify(r, null, 2)}</pre>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
