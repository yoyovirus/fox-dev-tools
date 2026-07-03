import { 
  Braces,
  CheckCircle2,
  GitCompare,
  Network,
  Code2,
  TableProperties,
  SearchCode,
  Workflow,
  Binary,
  ImageUp,
  ImageDown,
  SplitSquareHorizontal,
  CaseSensitive,
  ListOrdered,
  FileDiff,
  Replace,
  BarChart2,
  Shuffle,
  CopyMinus,
  AlignLeft,
  Wand2,
  LucideIcon
} from "lucide-react";

/**
 * Centralized Lucide icons for all tools.
 * Single source of truth — used by ToolIcon, ToolIconSmall, and ToolHeader.
 */
export const toolIcons: Record<string, LucideIcon> = {
  "JSON Formatter": Braces,
  "JSON Validator": CheckCircle2,
  "JSON Diff": GitCompare,
  "JSON Visualizer": Network,
  "JSON Type Generator": Code2,
  "JSON to Table": TableProperties,
  "JSON Path Tester": SearchCode,
  "JSON Relationship Visualizer": Workflow,
  "Base64 Encoder / Decoder": Binary,
  "Image to Base64": ImageUp,
  "Base64 to Image": ImageDown,
  "Text Compare": SplitSquareHorizontal,
  "Case Converter": CaseSensitive,
  "Line Tools": ListOrdered,
  "Text Diff": FileDiff,
  "Find & Replace": Replace,
  "Text Statistics": BarChart2,
  "Anagram": Shuffle,
  "Remove Duplicates": CopyMinus,
  "Lorem Ipsum": AlignLeft,
  "Blabber": Wand2,
};

/**
 * Get the Lucide icon component for a given tool name.
 * Returns null if the tool is not found.
 */
export function getToolIcon(toolName: string): LucideIcon | null {
  return toolIcons[toolName] || null;
}
