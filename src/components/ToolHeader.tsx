"use client";

import React from "react";
import { getToolColor } from "@/lib/toolColors";
import { getToolIcon } from "@/lib/toolIcons";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ToolHeaderProps {
  toolName: string;
  toolColor: string;
  description?: string;
}

/**
 * Reusable tool header component with custom icon
 */
export function ToolHeader({ toolName, toolColor, description }: ToolHeaderProps) {
  const iconColor = getToolColor(toolName) || toolColor;
  const IconComponent = getToolIcon(toolName);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${iconColor}15`,
              borderColor: `${iconColor}30`,
            }}
          >
            {IconComponent ? (
              <IconComponent
                className="w-6 h-6 shrink-0"
                style={{ color: iconColor }}
              />
            ) : (
              <div 
                className="w-6 h-6 shrink-0 flex items-center justify-center font-bold text-xs" 
                style={{ color: iconColor }}
              >
                ?
              </div>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-foreground">{toolName}</h2>
        </div>
        
        {description && (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-8 w-8 rounded-full" 
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[90vw] rounded-lg">
              <DialogHeader>
                <DialogTitle>{toolName}</DialogTitle>
                <DialogDescription className="pt-2 text-base text-foreground">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {description && (
        <p className="hidden md:block text-sm text-muted-foreground ml-[46px]">{description}</p>
      )}
    </div>
  );
}
