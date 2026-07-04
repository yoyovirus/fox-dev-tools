"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
    SidebarInput
} from "@/components/ui/sidebar";
import { ToolIconSmall } from "./ToolIconSmall";
import { getToolColor } from "@/lib/toolColors";

const JSON_TOOLS = [
    { name: "JSON Formatter", href: "/en/json-tools/json-formatter" },
    { name: "JSON Validator", href: "/en/json-tools/json-validator" },
    { name: "JSON Diff", href: "/en/json-tools/json-diff" },
    { name: "JSON Visualizer", href: "/en/json-tools/json-visualizer" },
    { name: "JSON Type Generator", href: "/en/json-tools/json-type-generator" },
    { name: "JSON to Table", href: "/en/json-tools/json-to-table" },
    { name: "JSON Path Tester", href: "/en/json-tools/json-path-tester" },
    { name: "JSON Relationship Visualizer", href: "/en/json-tools/json-relationship-visualizer" },
];

const BASE64_TOOLS = [
    { name: "Base64 Encoder / Decoder", href: "/en/base64-tools/base64-encoder-decoder" },
    { name: "Image to Base64", href: "/en/base64-tools/image-to-base64" },
    { name: "Base64 to Image", href: "/en/base64-tools/base64-to-image" },
];

const TEXT_TOOLS = [
    { name: "Text Compare", href: "/en/text-tools/text-compare" },
    { name: "Case Converter", href: "/en/text-tools/case-converter" },
    { name: "Line Tools", href: "/en/text-tools/line-tools" },
    { name: "Text Diff", href: "/en/text-tools/text-diff" },
    { name: "Find & Replace", href: "/en/text-tools/find-replace" },
    { name: "Text Statistics", href: "/en/text-tools/text-statistics" },
    { name: "Anagram", href: "/en/text-tools/anagram" },
    { name: "Remove Duplicates", href: "/en/text-tools/remove-duplicates" },
    { name: "Lorem Ipsum", href: "/en/text-tools/lorem-ipsum" },
    { name: "Blabber", href: "/en/text-tools/blabber" },
];

const TOOL_CATEGORIES = [
    { name: "JSON Tools", tools: JSON_TOOLS },
    { name: "Base64 Tools", tools: BASE64_TOOLS },
    { name: "Text Tools", tools: TEXT_TOOLS },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { state } = useSidebar();
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredCategories = React.useMemo(() => {
        if (!searchQuery.trim()) return TOOL_CATEGORIES;
        const lowerQuery = searchQuery.toLowerCase();
        
        return TOOL_CATEGORIES.map(category => {
            const filteredTools = category.tools.filter(tool => 
                tool.name.toLowerCase().includes(lowerQuery)
            );
            return { ...category, tools: filteredTools };
        }).filter(category => category.tools.length > 0);
    }, [searchQuery]);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Image
                                        src="/foxdevtools_logo.png"
                                        alt="FoX Dev Tools"
                                        width={32}
                                        height={32}
                                        className="rounded-lg object-contain"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">FoX Dev Tools</span>
                                    <span className="truncate text-xs">For Developers</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <form 
                    onSubmit={(e) => e.preventDefault()}
                    className="p-2 pt-0 group-data-[collapsible=icon]:hidden"
                >
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
                        <SidebarInput 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tools..." 
                            className="h-8 pl-8" 
                        />
                    </div>
                </form>
            </SidebarHeader>
            <SidebarContent>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                        <SidebarGroup key={category.name}>
                            <SidebarGroupLabel>{category.name}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {category.tools.map((tool) => {
                                        const isActive = pathname === tool.href;
                                        const toolColor = getToolColor(tool.name);
                                        return (
                                            <SidebarMenuItem key={tool.name}>
                                                <SidebarMenuButton asChild isActive={isActive} tooltip={tool.name}>
                                                    <Link href={tool.href} className="flex items-center gap-2">
                                                        <div style={{ color: toolColor }} className="flex items-center justify-center">
                                                            <ToolIconSmall toolName={tool.name} size={16} />
                                                        </div>
                                                        <span>{tool.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                        No tools found.
                    </div>
                )}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
