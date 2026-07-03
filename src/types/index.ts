/**
 * Shared type definitions for the application.
 * Central source of truth for common interfaces.
 */

/** A tool entry for sidebar navigation */
export interface ToolEntry {
    name: string;
    href: string;
    icon: React.ReactNode;
    color: string;
}

/** A category of tools for sidebar grouping */
export interface ToolCategory {
    name: string;
    icon: React.ReactNode;
    tools: ToolEntry[];
}

/** Generic tool page state return */
export interface ToolPageState {
    input: string;
    output: string;
    error: string | null;
}
