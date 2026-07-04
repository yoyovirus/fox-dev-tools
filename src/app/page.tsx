"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolIconSmall } from "@/components/ToolIconSmall";
import { getToolColor } from "@/lib/toolColors";
import { LockClosedIcon, LayersIcon, TokensIcon, CheckCircledIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { GravityStarsBackground } from "@/components/GravityStarsBackground";

const CATEGORIES = [
    {
        id: "json",
        name: "JSON Tools",
        description: "A suite for formatting, validating, and transforming JSON data.",
        color: "#7C3AED",
        tools: [
            { id: "fmt", name: "JSON Formatter", description: "Beautify and minify JSON with customizable indentation.", href: "/en/json-tools/json-formatter", iconLarge: <ToolIconSmall toolName="JSON Formatter" size={32} /> },
            { id: "val", name: "JSON Validator", description: "Quickly validate your JSON data to pinpoint syntax errors.", href: "/en/json-tools/json-validator", iconLarge: <ToolIconSmall toolName="JSON Validator" size={32} /> },
            { id: "dif", name: "JSON Diff", description: "Compare two JSON objects and highlight their differences.", href: "/en/json-tools/json-diff", iconLarge: <ToolIconSmall toolName="JSON Diff" size={32} /> },
            { id: "viz", name: "JSON Visualizer", description: "Explore JSON structures in an interactive, collapsible tree view.", href: "/en/json-tools/json-visualizer", iconLarge: <ToolIconSmall toolName="JSON Visualizer" size={32} /> },
            { id: "gen", name: "JSON Type Generator", description: "Automatically generate TypeScript interfaces and Go structs from any JSON structure.", href: "/en/json-tools/json-type-generator", iconLarge: <ToolIconSmall toolName="JSON Type Generator" size={32} /> },
            { id: "tbl", name: "JSON to Table", description: "Convert JSON arrays into clean, readable tables instantly.", href: "/en/json-tools/json-to-table", iconLarge: <ToolIconSmall toolName="JSON to Table" size={32} /> },
            { id: "pth", name: "JSON Path Tester", description: "Test JSONPath expressions against your data and see matched values instantly.", href: "/en/json-tools/json-path-tester", iconLarge: <ToolIconSmall toolName="JSON Path Tester" size={32} /> },
            { id: "rel", name: "JSON Relationship Visualizer", description: "Explore JSON structures as an interactive node graph and understand their relationships.", href: "/en/json-tools/json-relationship-visualizer", iconLarge: <ToolIconSmall toolName="JSON Relationship Visualizer" size={32} /> },
        ]
    },
    {
        id: "base64",
        name: "Base64 Tools",
        description: "Encode, decode, and convert between Base64 and images.",
        color: "#0EA5E9",
        tools: [
            { id: "enc", name: "Base64 Encoder / Decoder", description: "Encode text to Base64 or decode it back in real-time.", href: "/en/base64-tools/base64-encoder-decoder", iconLarge: <ToolIconSmall toolName="Base64 Encoder / Decoder" size={32} /> },
            { id: "i2b", name: "Image to Base64", description: "Convert images to Base64 strings instantly.", href: "/en/base64-tools/image-to-base64", iconLarge: <ToolIconSmall toolName="Image to Base64" size={32} /> },
            { id: "b2i", name: "Base64 to Image", description: "Decode Base64 strings back into images.", href: "/en/base64-tools/base64-to-image", iconLarge: <ToolIconSmall toolName="Base64 to Image" size={32} /> },
        ]
    },
    {
        id: "text",
        name: "Text Tools",
        description: "A comprehensive suite for text manipulation, comparison, and generation.",
        color: "#14B8A6",
        tools: [
            { id: "cmp", name: "Text Compare", description: "Compare two texts side by side and identify differences.", href: "/en/text-tools/text-compare", iconLarge: <ToolIconSmall toolName="Text Compare" size={32} /> },
            { id: "case", name: "Case Converter", description: "Convert text between uppercase, lowercase, title case, and more.", href: "/en/text-tools/case-converter", iconLarge: <ToolIconSmall toolName="Case Converter" size={32} /> },
            { id: "line", name: "Line Tools", description: "Sort, reverse, shuffle, and manipulate text lines.", href: "/en/text-tools/line-tools", iconLarge: <ToolIconSmall toolName="Line Tools" size={32} /> },
            { id: "diff", name: "Text Diff", description: "Find differences between two texts with highlighted changes.", href: "/en/text-tools/text-diff", iconLarge: <ToolIconSmall toolName="Text Diff" size={32} /> },
            { id: "find", name: "Find & Replace", description: "Search and replace text with support for regex.", href: "/en/text-tools/find-replace", iconLarge: <ToolIconSmall toolName="Find & Replace" size={32} /> },
            { id: "stat", name: "Text Statistics", description: "Get detailed statistics about your text including word count, characters, and more.", href: "/en/text-tools/text-statistics", iconLarge: <ToolIconSmall toolName="Text Statistics" size={32} /> },
            { id: "ana", name: "Anagram", description: "Find anagrams and rearrange letters to form new words.", href: "/en/text-tools/anagram", iconLarge: <ToolIconSmall toolName="Anagram" size={32} /> },
            { id: "dup", name: "Remove Duplicates", description: "Remove duplicate lines or words from your text.", href: "/en/text-tools/remove-duplicates", iconLarge: <ToolIconSmall toolName="Remove Duplicates" size={32} /> },
            { id: "lorem", name: "Lorem Ipsum", description: "Generate placeholder Lorem Ipsum text for your designs.", href: "/en/text-tools/lorem-ipsum", iconLarge: <ToolIconSmall toolName="Lorem Ipsum" size={32} /> },
            { id: "blab", name: "Blabber", description: "Generate random placeholder text similar to Lorem Ipsum.", href: "/en/text-tools/blabber", iconLarge: <ToolIconSmall toolName="Blabber" size={32} /> },
        ]
    }
];

export default function Home() {
    return (
        <div className="flex flex-col gap-12 w-full pb-12">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-40">
                <GravityStarsBackground className="text-primary" starsCount={250} movementSpeed={0.5} starsOpacity={0.8} />
            </div>
            
            <div className="relative z-10 flex flex-col gap-12 w-full max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center mt-12 mb-4 gap-6">
                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 flex gap-1.5 font-semibold text-xs rounded-full">
                    <LockClosedIcon className="size-4" /> 100% PRIVATE • CLIENT-SIDE ONLY
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground max-w-3xl">
                    Tools for Developers.<br />
                    <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">Where Data Never Leaves.</span>
                </h1>
                
                <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl">
                    Experience fast, seamless transformations and validations—right in your browser. No uploads, no delays, no tracking.
                </p>

                <div className="flex flex-wrap justify-center gap-6 mt-4">
                    {[
                        { icon: <LockClosedIcon className="text-primary size-5" />, title: "Zero Data Leakage" },
                        { icon: <LayersIcon className="text-primary size-5" />, title: "Zero Storage" },
                        { icon: <TokensIcon className="text-primary size-5" />, title: "Zero Backend" },
                        { icon: <CheckCircledIcon className="text-primary size-5" />, title: "Absolute Privacy" }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-sm font-semibold">{item.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dashboard Categories */}
            {CATEGORIES.map((category) => (
                <div key={category.id} className="flex flex-col gap-4">
                    <div className="flex items-center mb-2">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.tools.map((tool) => {
                            const toolColor = getToolColor(tool.name);
                            return (
                                <Link key={tool.id} href={tool.href} className="group outline-none">
                                    <Card className="h-full transition-all hover:bg-muted/50 hover:border-border cursor-pointer">
                                        <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-5">
                                            <div 
                                                className="p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                                                style={{ backgroundColor: `${toolColor}15`, color: toolColor }}
                                            >
                                                {tool.iconLarge}
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center gap-1.5">
                                                    {tool.name}
                                                    <ArrowRightIcon className="size-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 leading-relaxed">
                                                    {tool.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}
