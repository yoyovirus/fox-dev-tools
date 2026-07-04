"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Trash2, Search, Download, Copy, X, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { SAMPLE_JSON_TO_TABLE } from "@/lib/sampleData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function ToTablePage() {
    const [input, setInput] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!input.trim()) {
            setError(null);
            return;
        }
        try {
            JSON.parse(input);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        }
    }, [input]);

    let parsedData: any = null;
    let headers: string[] = [];

    try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed) && parsed.length > 0) {
            parsedData = parsed;
            headers = Array.from(new Set(parsed.flatMap((item) => Object.keys(item))));
        } else if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            parsedData = [parsed];
            headers = Object.keys(parsed);
        }
    } catch (e) {
        parsedData = null;
    }

    if (parsedData && searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        parsedData = parsedData.filter((row: any) =>
            headers.some((h) => String(row[h] ?? "").toLowerCase().includes(lowerQuery))
        );
    }

    const exportCsv = () => {
        if (!parsedData || parsedData.length === 0) return;
        const csvContent = [
            headers.join(","),
            ...parsedData.map((row: any) =>
                headers.map((h) =>
                    typeof row[h] === "object" ? `"${JSON.stringify(row[h]).replace(/"/g, '""')}"` : `"${String(row[h] ?? "").replace(/"/g, '""')}"`
                ).join(",")
            )
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyMarkdown = () => {
        if (!parsedData || parsedData.length === 0) return "";
        const headers = Object.keys(parsedData[0]);
        const headerRow = `| ${headers.join(" | ")} |`;
        const dividerRow = `| ${headers.map(() => "---").join(" | ")} |`;
        const dataRows = parsedData.map((row: any) =>
            `| ${headers.map(h => typeof row[h] === "object" ? JSON.stringify(row[h]) : String(row[h] ?? "")).join(" | ")} |`
        ).join("\n");
        return `${headerRow}\n${dividerRow}\n${dataRows}`;
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <ToolHeader
                toolName="JSON to Table"
                toolColor={getToolColor("JSON to Table")}
                description="Convert JSON arrays into clean, readable tables instantly."
            />

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>Invalid JSON: {error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            JSON Input
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={() => setInput(SAMPLE_JSON_TO_TABLE)} />
                            {input && (
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
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Input" onClickAction={() => setInput("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-background">
                        <Editor
                            value={input}
                            placeholder='Paste a JSON array like [{"id": 1, "name": "Alice"}]...'
                            onChange={(val) => setInput(val || "")}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Table Output
                            {parsedData && (
                                <Badge variant="outline" className="font-mono bg-background text-muted-foreground ml-3 h-5 px-1.5 text-[10px] rounded-sm">
                                    {parsedData.length} rows · {headers.length} cols
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {parsedData && (
                                <>
                                    <div className="relative w-32 sm:w-48 mr-1">
                                        <Search className="absolute left-2 top-1.5 size-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search table..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-7 pr-7 bg-background h-7 text-xs"
                                        />
                                        {searchQuery && (
                                            <Button variant="ghost" size="icon" className="absolute right-0.5 top-0.5 size-6 hover:bg-muted/50 rounded-sm" onClick={() => setSearchQuery("")}>
                                                <X className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={Download} tooltipText="Export CSV" onClickAction={exportCsv} />
                                    <CopyButton textToCopy={handleCopyMarkdown} tooltipText="Copy Markdown Table" size="sm" className="h-7 px-2 text-xs gap-1.5" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear Output" onClickAction={() => setInput("")} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto bg-card">
                        {parsedData && parsedData.length > 0 ? (
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 border-b z-10">
                                    <tr>
                                        {headers.map((h, i) => (
                                            <th key={i} className="px-4 py-2 font-semibold border-r last:border-r-0 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((row: any, i: number) => (
                                        <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
                                            {headers.map((h, j) => {
                                                const val = row[h];
                                                const displayVal = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
                                                return (
                                                    <td key={j} className="px-4 py-2 border-r last:border-r-0 max-w-[200px] truncate" title={displayVal}>
                                                        {displayVal}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
                                {input && !error ? "JSON object/array doesn't have tabular data to display." : "Enter a valid JSON array of objects to view as a table."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
