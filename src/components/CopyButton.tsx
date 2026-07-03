"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedCopy } from "./AnimatedIcons";

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
    textToCopy: string | (() => string);
    tooltipText?: string;
    iconClassName?: string;
}

export function CopyButton({
    textToCopy,
    variant = "ghost",
    size = "icon",
    className,
    tooltipText = "Copy",
    iconClassName,
    ...props
}: CopyButtonProps) {
    const [copied, setCopied] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);

    const handleCopy = React.useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            if (copied) return;
            try {
                const text = typeof textToCopy === 'function' ? textToCopy() : textToCopy;
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
            props.onClick?.(e);
        },
        [copied, textToCopy, props]
    );

    const content = (
        <Button 
            variant={variant} 
            size={size} 
            className={cn(size === 'icon' ? 'size-7' : 'gap-1.5 h-7 px-2 text-xs', className)} 
            onClick={handleCopy} 
            onMouseEnter={(e) => { setHovered(true); props.onMouseEnter?.(e); }}
            onMouseLeave={(e) => { setHovered(false); props.onMouseLeave?.(e); }}
            {...props}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={copied ? 'check' : 'copy'}
                    initial={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-center"
                >
                    {copied ? (
                        <Check className={cn("size-3.5 text-green-500", iconClassName)} />
                    ) : (
                        <AnimatedCopy isAnimating={hovered} className={cn("size-3.5", iconClassName)} />
                    )}
                </motion.span>
            </AnimatePresence>
            {size !== "icon" && <span>{tooltipText}</span>}
        </Button>
    );

    if (size === "icon" || tooltipText) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent>
                    {copied ? "Copied!" : tooltipText}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
