"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { getToolColor } from "@/lib/toolColors"
import { ToolIconSmall } from "./ToolIconSmall"
import { Search } from "lucide-react"

const ALL_TOOLS = [
  // JSON
  { name: "JSON Formatter", category: "JSON Tools", href: "/en/json-tools/json-formatter" },
  { name: "JSON Validator", category: "JSON Tools", href: "/en/json-tools/json-validator" },
  { name: "JSON Diff", category: "JSON Tools", href: "/en/json-tools/json-diff" },
  { name: "JSON Visualizer", category: "JSON Tools", href: "/en/json-tools/json-visualizer" },
  { name: "JSON Type Generator", category: "JSON Tools", href: "/en/json-tools/json-type-generator" },
  { name: "JSON to Table", category: "JSON Tools", href: "/en/json-tools/json-to-table" },
  { name: "JSON Path Tester", category: "JSON Tools", href: "/en/json-tools/json-path-tester" },
  { name: "JSON Relationship Visualizer", category: "JSON Tools", href: "/en/json-tools/json-relationship-visualizer" },
  // Base64
  { name: "Base64 Encoder / Decoder", category: "Base64 Tools", href: "/en/base64-tools/base64-encoder-decoder" },
  { name: "Image to Base64", category: "Base64 Tools", href: "/en/base64-tools/image-to-base64" },
  { name: "Base64 to Image", category: "Base64 Tools", href: "/en/base64-tools/base64-to-image" },
  // Text
  { name: "Text Compare", category: "Text Tools", href: "/en/text-tools/text-compare" },
  { name: "Case Converter", category: "Text Tools", href: "/en/text-tools/case-converter" },
  { name: "Line Tools", category: "Text Tools", href: "/en/text-tools/line-tools" },
  { name: "Text Diff", category: "Text Tools", href: "/en/text-tools/text-diff" },
  { name: "Find & Replace", category: "Text Tools", href: "/en/text-tools/find-replace" },
  { name: "Text Statistics", category: "Text Tools", href: "/en/text-tools/text-statistics" },
  { name: "Anagram", category: "Text Tools", href: "/en/text-tools/anagram" },
  { name: "Remove Duplicates", category: "Text Tools", href: "/en/text-tools/remove-duplicates" },
  { name: "Lorem Ipsum", category: "Text Tools", href: "/en/text-tools/lorem-ipsum" },
  { name: "Blabber", category: "Text Tools", href: "/en/text-tools/blabber" },
]

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center md:justify-start gap-2 rounded-lg border bg-muted/50 h-9 w-9 md:h-auto md:w-full md:px-3 md:py-1.5 text-sm text-muted-foreground hover:bg-muted/80 transition-colors md:max-w-xs"
      >
        <Search className="size-4 md:hidden" />
        <span className="hidden md:flex flex-1 text-left">Search tools...</span>
        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a tool name or category..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Array.from(new Set(ALL_TOOLS.map((t) => t.category))).map((category) => (
            <CommandGroup key={category} heading={category}>
              {ALL_TOOLS.filter((t) => t.category === category).map((tool) => (
                <CommandItem
                  key={tool.href}
                  value={`${tool.name} ${tool.category}`}
                  onSelect={() => {
                    runCommand(() => router.push(tool.href))
                  }}
                  className="flex items-center gap-2"
                >
                  <div style={{ color: getToolColor(tool.name) }} className="flex shrink-0">
                    <ToolIconSmall toolName={tool.name} size={16} />
                  </div>
                  <span>{tool.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
