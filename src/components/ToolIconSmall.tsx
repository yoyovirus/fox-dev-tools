"use client";

import React from "react";
import { getToolColor } from "@/lib/toolColors";
import { getToolIcon } from "@/lib/toolIcons";

interface ToolIconSmallProps {
  toolName: string;
  size?: number;
}

/**
 * Small icon component for tool cards on home page
 */
export function ToolIconSmall({ toolName, size = 20 }: ToolIconSmallProps) {
  const IconComponent = getToolIcon(toolName);
  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      className="shrink-0"
      style={{ color: getToolColor(toolName) }}
    />
  );
}
