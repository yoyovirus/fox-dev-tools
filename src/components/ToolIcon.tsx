"use client";

import React from "react";
import { getToolColor } from "@/lib/toolColors";
import { getToolIcon } from "@/lib/toolIcons";

interface ToolIconProps {
  toolName: string;
  isActive?: boolean;
  size?: number;
}

/**
 * Custom Lucide icon component for tools
 */
export function ToolIcon({ toolName, isActive = false, size = 32 }: ToolIconProps) {
  const toolColor = getToolColor(toolName);
  const IconComponent = getToolIcon(toolName);

  if (!IconComponent) {
    return (
      <div
        className="rounded-md flex items-center justify-center text-[0.7rem] font-bold shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: "var(--muted)",
          color: isActive ? "var(--primary)" : "var(--muted-foreground)",
        }}
      >
        ?
      </div>
    );
  }

  return (
    <div
      className="rounded-md flex items-center justify-center shrink-0 overflow-hidden transition-colors duration-200"
      style={{
        width: size,
        height: size,
        backgroundColor: isActive ? `${toolColor}25` : `${toolColor}15`,
      }}
    >
      <IconComponent
        className="shrink-0"
        size={size - 6}
        style={{ color: toolColor }}
      />
    </div>
  );
}
