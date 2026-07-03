"use client";
/*
  Website: FoX Dev Tools - Tools for Developers
  Author: Rahul Khedekar
  Copyright © 2026 FoX Dev Tools. All rights reserved.

  This code is proprietary and may not be copied, modified,
  or distributed without permission.
*/

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Network, Table, Maximize, ZoomIn, ZoomOut, Download, Trash2, AlertCircle, FileText, Copy } from "lucide-react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { SAMPLE_JSON_RELATIONSHIP_VISUALIZER } from "@/lib/sampleData";
import { useTheme } from "next-themes";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";
type NodeType = "object" | "array" | "string" | "number" | "boolean" | "null";

interface TreeNode {
    id: string;
    key: string;
    path: string;
    type: NodeType;
    value: unknown;
    primitives: { key: string; value: unknown; type: NodeType; path: string }[];
    children: TreeNode[];
    depth: number;
    totalDescendants: number;
}

// == Helpers ==================================================================
function getType(val: unknown): NodeType {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    return typeof val as NodeType;
}

function buildTree(val: unknown, key: string, depth: number, id: string, path = ""): TreeNode {
    const type = getType(val);
    const primitives: { key: string; value: unknown; type: NodeType; path: string }[] = [];
    const children: TreeNode[] = [];
    let totalDescendants = 0;

    const currentPath = path ? (Array.isArray(val) ? path : `${path}.${key}`) : key;

    if (type === "object" || type === "array") {
        const entries = Array.isArray(val)
            ? (val as unknown[]).map((v, i): [string, unknown] => [`[${i}]`, v])
            : Object.entries(val as Record<string, unknown>);

        entries.forEach(([k, v], i) => {
            const childType = getType(v);
            const childPath = type === "array" ? `${currentPath}${k}` : `${currentPath}.${k}`;
            if (childType === "object" || childType === "array") {
                const childNode = buildTree(v, k, depth + 1, `${id}-${i}`, currentPath);
                children.push(childNode);
                totalDescendants += 1 + childNode.totalDescendants;
            } else {
                primitives.push({ key: k, value: v, type: childType, path: childPath });
            }
        });
    }

    return { id, key, path: currentPath, type, value: val, primitives, children, depth, totalDescendants };
}

const TYPE_COLORS: Record<NodeType, string> = {
    object: "#4F46E5",
    array: "#059669",
    string: "#059669",
    number: "#D97706",
    boolean: "#DC2626",
    null: "#6B7280",
};

// == Stat collector ===========================================================
interface JsonStats {
    totalKeys: number;
    depth: number;
    arrays: number;
    objects: number;
    strings: number;
    numbers: number;
    booleans: number;
    nulls: number;
}

function collectStats(val: unknown, curDepth = 0): JsonStats {
    const s: JsonStats = { totalKeys: 0, depth: curDepth, arrays: 0, objects: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };
    function walk(v: unknown, d: number) {
        if (v === null) { s.nulls++; return; }
        if (Array.isArray(v)) {
            s.arrays++;
            s.depth = Math.max(s.depth, d);
            v.forEach(item => walk(item, d + 1));
        } else if (typeof v === "object") {
            s.objects++;
            s.depth = Math.max(s.depth, d);
            for (const [, child] of Object.entries(v as Record<string, unknown>)) {
                s.totalKeys++;
                walk(child, d + 1);
            }
        } else if (typeof v === "string") s.strings++;
        else if (typeof v === "number") s.numbers++;
        else if (typeof v === "boolean") s.booleans++;
    }
    walk(val, curDepth);
    return s;
}

// == Tree Renderer (Vertical Tidy Tree) =======================================
const NODE_W = 240;
const HEADER_H = 36;
const ROW_H = 20;
const V_GAP = 80;
const H_GAP = 40;

interface LayoutNode {
    node: TreeNode;
    x: number;
    y: number;
    parentId?: string;
}

function getNodeHeight(node: TreeNode): number {
    return HEADER_H + (node.primitives.length * ROW_H) + (node.primitives.length > 0 ? 12 : 0);
}

function layoutTree(root: TreeNode): LayoutNode[] {
    const result: LayoutNode[] = [];
    const subtreeWidths: Record<string, number> = {};

    function calcWidth(n: TreeNode): number {
        if (n.children.length === 0) {
            subtreeWidths[n.id] = NODE_W;
            return NODE_W;
        }
        const w = n.children.reduce((sum, child) => sum + calcWidth(child), 0) + (n.children.length - 1) * H_GAP;
        subtreeWidths[n.id] = Math.max(w, NODE_W);
        return subtreeWidths[n.id];
    }
    calcWidth(root);

    function place(n: TreeNode, xOffset: number, y: number, parentId?: string) {
        const myWidth = subtreeWidths[n.id];
        const x = xOffset + myWidth / 2 - NODE_W / 2;
        result.push({ node: n, x, y, parentId });

        let currentX = xOffset;
        n.children.forEach(child => {
            place(child, currentX, y + getNodeHeight(n) + V_GAP, n.id);
            currentX += subtreeWidths[child.id] + H_GAP;
        });
    }

    place(root, 0, 0);
    return result;
}

function TreeView({ tree, stats, json }: { tree: TreeNode, stats: JsonStats | null, json: any }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isDark = mounted && resolvedTheme === "dark";
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 40, y: 40 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [copiedNodeId, setCopiedNodeId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const nodes = layoutTree(tree);

    // Calculate actual content bounds
    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + NODE_W));
    const maxY = Math.max(...nodes.map(n => n.y + getNodeHeight(n.node)));
    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const nodeById: Record<string, LayoutNode> = {};
    nodes.forEach(n => { nodeById[n.node.id] = n; });

    const edges: { x1: number; y1: number; x2: number; y2: number; label: string }[] = [];
    nodes.forEach(n => {
        if (n.parentId && nodeById[n.parentId]) {
            const p = nodeById[n.parentId];
            edges.push({
                x1: p.x + NODE_W / 2,
                y1: p.y + getNodeHeight(p.node),
                x2: n.x + NODE_W / 2,
                y2: n.y,
                label: n.node.key
            });
        }
    });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelManual = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;

            setZoom(prevZoom => {
                const newZoom = Math.min(Math.max(prevZoom * delta, 0.1), 3);

                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                setOffset(prevOffset => {
                    const dx = (mouseX - prevOffset.x) * (newZoom / prevZoom - 1);
                    const dy = (mouseY - prevOffset.y) * (newZoom / prevZoom - 1);
                    return { x: prevOffset.x - dx, y: prevOffset.y - dy };
                });

                return newZoom;
            });
        };

        container.addEventListener("wheel", handleWheelManual, { passive: false });
        return () => container.removeEventListener("wheel", handleWheelManual);
    }, []);

    const fit = () => {
        if (!svgRef.current || !containerRef.current) return;
        const container = containerRef.current;
        const padding = 80;
        const scaleX = (container.clientWidth - padding) / contentW;
        const scaleY = (container.clientHeight - padding) / contentH;
        const newZoom = Math.min(scaleX, scaleY, 1);

        const offsetX = (container.clientWidth - contentW * newZoom) / 2 - minX * newZoom;
        const offsetY = (container.clientHeight - contentH * newZoom) / 2 - minY * newZoom;

        setZoom(newZoom);
        setOffset({ x: offsetX, y: offsetY });
    };

    // Auto-fit on mount or tree change
    useEffect(() => {
        fit();
    }, [tree]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden bg-muted/10 cursor-grab active:cursor-grabbing rounded-lg border shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Floating Controls Overlay (Stats + Nav) */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
                {/* Stats */}
                <div className="flex bg-background border shadow-sm rounded-lg p-2 pointer-events-auto">
                    {stats && (
                        <>
                            {[
                                { label: "Objects", value: stats.objects, color: TYPE_COLORS.object },
                                { label: "Arrays", value: stats.arrays, color: TYPE_COLORS.array },
                                { label: "Keys", value: stats.totalKeys, color: "currentColor" },
                                { label: "Depth", value: stats.depth, color: "#EC4899" }
                            ].map((s, i) => (
                                <div key={s.label} className="flex items-center">
                                    <div className="flex flex-col px-3">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                                        <div className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</div>
                                    </div>
                                    {i < 3 && <Separator orientation="vertical" className="h-6" />}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Nav Buttons */}
                <div className="flex bg-background border shadow-sm rounded-lg p-1 gap-1 pointer-events-auto">
                    <AnimatedButton variant="ghost" size="icon" className="size-8" icon={Maximize} tooltipText="Fit to screen" onClickAction={fit} />
                    <AnimatedButton variant="ghost" size="icon" className="size-8" icon={ZoomIn} tooltipText="Zoom in" onClickAction={() => setZoom(z => Math.min(z + 0.15, 3))} />
                    <AnimatedButton variant="ghost" size="icon" className="size-8" icon={ZoomOut} tooltipText="Zoom out" onClickAction={() => setZoom(z => Math.max(z - 0.15, 0.2))} />
                </div>
            </div>

            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ display: "block" }}
            >
                <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
                    {/* Edges */}
                    <g>
                        {edges.map((e, i) => {
                            const my = (e.y1 + e.y2) / 2;
                            const path = `M${e.x1},${e.y1} C${e.x1},${my} ${e.x2},${my} ${e.x2},${e.y2}`;
                            return (
                                <g key={i}>
                                    <path
                                        d={path}
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-black/30 dark:text-white/40"
                                        strokeWidth={2}
                                    />
                                    {/* Label on path */}
                                    <rect
                                        x={(e.x1 + e.x2) / 2 - (Math.max(e.label.length, 1) * 4)}
                                        y={my - 8}
                                        width={Math.max(e.label.length, 1) * 8}
                                        height={16}
                                        rx={4}
                                        fill="currentColor"
                                        className="text-slate-100 dark:text-slate-800"
                                    />
                                    <text
                                        x={(e.x1 + e.x2) / 2}
                                        y={my + 4}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fontWeight="600"
                                        fill="currentColor"
                                        className="text-black/80 dark:text-white/80"
                                    >
                                        {e.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Nodes */}
                    <g>
                        {nodes.map(({ node, x, y }) => {
                            const color = TYPE_COLORS[node.type];
                            const hHeight = HEADER_H;
                            const bHeight = (node.primitives.length * ROW_H) + (node.primitives.length > 0 ? 12 : 0);
                            const totalH = hHeight + bHeight;

                            return (
                                <g key={node.id}>
                                    {/* Shadow/Glow */}
                                    <rect
                                        x={x} y={y}
                                        width={NODE_W} height={totalH}
                                        rx={12} ry={12}
                                        fill={isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)"}
                                        style={{ filter: "blur(4px)" }}
                                    />
                                    {/* Main Container */}
                                    <rect
                                        x={x} y={y}
                                        width={NODE_W} height={totalH}
                                        rx={12} ry={12}
                                        fill={isDark ? "#1E293B" : "#FFFFFF"}
                                        stroke={isDark ? color : color}
                                        strokeWidth={1.5}
                                    />

                                    {/* Header */}
                                    <path
                                        d={`M${x},${y + 12} a12,12 0 0 1 12,-12 h${NODE_W - 24} a12,12 0 0 1 12,12 v${HEADER_H - 12} h-${NODE_W} z`}
                                        fill={color}
                                    />

                                    {/* Type Icon & Label */}
                                    <text x={x + 12} y={y + 22} fontSize={12} fontWeight={800} fill="#FFFFFF">
                                        {node.type === "array" ? "ARR" : "OBJ"}
                                    </text>
                                    <text x={x + 45} y={y + 22} fontSize={13} fontWeight={700} fill="#FFFFFF" style={{ userSelect: "none" }}>
                                        {node.key === "root" ? "root" : node.key} ({node.children.length + node.primitives.length})
                                    </text>

                                    {/* Copy button */}
                                    <g
                                        transform={`translate(${x + NODE_W - 32}, ${y + 8})`}
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const jsonStr = JSON.stringify(node.value, null, 2);
                                            navigator.clipboard.writeText(jsonStr);
                                            setCopiedNodeId(node.id);
                                            setTimeout(() => setCopiedNodeId(null), 2000);
                                        }}
                                    >
                                        <rect width={24} height={20} rx={4} fill="rgba(255,255,255,0.2)" />
                                        {copiedNodeId === node.id ? (
                                            <path d="M7,10 L11,14 L17,6" fill="none" stroke="#4ADE80" strokeWidth={2} />
                                        ) : (
                                            <path d="M7,6 h7 v8 h-7 z M10,4 h4 v3" fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
                                        )}
                                    </g>

                                    {/* Body (Primitives) */}
                                    {node.primitives.length > 0 && (
                                        <g transform={`translate(${x + 12}, ${y + HEADER_H + 8})`}>
                                            {node.primitives.map((p, pi) => (
                                                <text
                                                    key={pi}
                                                    y={pi * ROW_H + 10}
                                                    fontSize={11}
                                                >
                                                    <tspan fill={isDark ? "#F472B6" : "#EC4899"} fontWeight="800">{p.key} : </tspan>
                                                    <tspan fill={TYPE_COLORS[p.type]}>{String(p.value)}</tspan>
                                                </text>
                                            ))}
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </g>
                </g>
            </svg>
        </div>
    );
}

// == Summary Table ============================================================
function SummaryView({ stats, json }: { stats: JsonStats; json: unknown }) {
    const rows = [
        { label: "Total Keys", value: stats.totalKeys, color: "#4F46E5" },
        { label: "Max Depth", value: stats.depth, color: "#0284C7" },
        { label: "Objects", value: stats.objects, color: "#4F46E5" },
        { label: "Arrays", value: stats.arrays, color: "#059669" },
        { label: "Strings", value: stats.strings, color: "#059669" },
        { label: "Numbers", value: stats.numbers, color: "#D97706" },
        { label: "Booleans", value: stats.booleans, color: "#DC2626" },
        { label: "Nulls", value: stats.nulls, color: "#6B7280" },
    ];

    const topEntries: { key: string; type: NodeType; children?: number }[] = [];
    if (json && typeof json === "object" && !Array.isArray(json)) {
        for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
            const t = getType(v);
            topEntries.push({ key: k, type: t, children: (t === "object" || t === "array") ? Object.keys(v as object).length : undefined });
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div>
                <div className="text-lg font-semibold mb-4">Structure Analysis</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rows.map(r => (
                        <div key={r.label} className="bg-card border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="text-3xl font-bold mb-1" style={{ color: r.color }}>{r.value}</div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{r.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {topEntries.length > 0 && (
                <div>
                    <div className="text-lg font-semibold mb-4">Top-Level Schema</div>
                    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Key</th>
                                    <th className="px-6 py-3 font-semibold">Type</th>
                                    <th className="px-6 py-3 font-semibold">Child Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {topEntries.map((e, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-primary font-medium">{e.key}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ backgroundColor: `${TYPE_COLORS[e.type]}15`, color: TYPE_COLORS[e.type] }}>
                                                {e.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{e.children ?? "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// == Main Page ================================================================
export default function JsonRelationshipVisualizerPage() {
    const [input, setInput] = useState<string>("");
    const [parsedJson, setParsedJson] = useState<object | null>(null);
    const [tree, setTree] = useState<TreeNode | null>(null);
    const [stats, setStats] = useState<JsonStats | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [view, setView] = useState<"graph" | "summary">("graph");

    const parse = useCallback((text: string) => {
        if (!text.trim()) { setParsedJson(null); setTree(null); setStats(null); setParseError(null); return; }
        try {
            const parsed = JSON.parse(text);
            setParsedJson(parsed as object);
            setTree(buildTree(parsed, "root", 0, "root", ""));
            setStats(collectStats(parsed));
            setParseError(null);
        } catch (e: unknown) {
            setParseError(e instanceof Error ? e.message : String(e));
            setParsedJson(null); setTree(null); setStats(null);
        }
    }, []);

    useEffect(() => { parse(input); }, [input, parse]);

    const handleDownload = () => {
        if (!parsedJson) return;
        const blob = new Blob([JSON.stringify(parsedJson, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "relationship-data.json";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="JSON Relationship Visualizer"
                toolColor={getToolColor("JSON Relationship Visualizer")}
                description="Explore JSON structures as an interactive graph and understand their relationships."
            />

            <div className="flex flex-wrap items-center gap-2 p-2 px-3 bg-muted/20 border rounded-lg shrink-0">
                <div className="flex rounded-md border shadow-sm overflow-hidden">
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 border-r transition-colors ${view === 'graph' ? 'bg-muted' : 'bg-background hover:bg-muted/50'}`} onClick={() => setView('graph')}>
                        <Network className="size-3.5" /> Graph
                    </button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 transition-colors ${view === 'summary' ? 'bg-muted' : 'bg-background hover:bg-muted/50'}`} onClick={() => setView('summary')}>
                        <Table className="size-3.5" /> Summary
                    </button>
                </div>
            </div>

            {parseError && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>Invalid JSON: {parseError}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[500px]">
                <div className="flex-[35] min-w-[260px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm h-full">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            JSON Input
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={() => setInput(SAMPLE_JSON_RELATIONSHIP_VISUALIZER)} />
                            {input && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />
                                    {parsedJson && (

                                        <CopyButton textToCopy={input} tooltipText="Copy Input" />
                                    )}
                                    {parsedJson && (
                                        <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download JSON" onClickAction={handleDownload} />
                                    )}
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Input" onClickAction={() => setInput("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            language="json"
                            value={input}
                            onChange={(v) => setInput(v || "")}
                            placeholder="Paste your JSON here..."
                        />
                    </div>
                </div>

                <div className="flex-[65] min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm h-full bg-card">
                    <div className="flex justify-between items-center border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {view === "graph" ? "Relationship Graph" : "Structure Summary"}
                        </div>
                        {view === "graph" && tree && (
                            <div className="flex gap-2 text-[10px] items-center -mt-1 font-mono uppercase tracking-widest">
                                <span className="flex items-center gap-1"><div className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLORS.object }} /> OBJ</span>
                                <span className="flex items-center gap-1"><div className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLORS.array }} /> ARR</span>
                                <span className="flex items-center gap-1"><div className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLORS.string }} /> STR</span>
                                <span className="flex items-center gap-1"><div className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLORS.number }} /> NUM</span>
                                <span className="flex items-center gap-1"><div className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLORS.boolean }} /> BOOL</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {parsedJson && (
                                <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={() => setInput("")} />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-background/50 relative">
                        {!parsedJson ? (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Paste valid JSON to visualize its structure and relationships.
                            </div>
                        ) : view === "graph" && tree ? (
                            <TreeView tree={tree} stats={stats} json={parsedJson} />
                        ) : view === "summary" && stats ? (
                            <div className="h-full overflow-auto">
                                <SummaryView stats={stats} json={parsedJson} />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
