import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Download, Trash2, RefreshCw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedDownload, AnimatedTrash, AnimatedRefresh, AnimatedFileText } from "./AnimatedIcons";

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
    onClickAction?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    tooltipText?: string;
    icon: React.ElementType;
    label?: string;
}

export function AnimatedButton({
    onClickAction,
    variant = "ghost",
    size = "icon",
    className,
    tooltipText,
    icon: Icon,
    label,
    ...props
}: AnimatedButtonProps) {
    const [clicked, setClicked] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);

    const handleClick = React.useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            if (clicked) return;
            try {
                if (onClickAction) {
                    await onClickAction(e);
                }
                setClicked(true);
                setTimeout(() => setClicked(false), 2000);
            } catch (err) {
                console.error("Action failed: ", err);
            }
            props.onClick?.(e);
        },
        [clicked, onClickAction, props]
    );

    let CustomAnimatedIcon: any = null;
    if (Icon === Download) CustomAnimatedIcon = AnimatedDownload;
    else if (Icon === Trash2) CustomAnimatedIcon = AnimatedTrash;
    else if (Icon === RefreshCw) CustomAnimatedIcon = AnimatedRefresh;
    else if (Icon === FileText) CustomAnimatedIcon = AnimatedFileText;

    const content = (
        <Button 
            variant={variant} 
            size={size} 
            className={cn(size === 'icon' ? 'size-7' : 'gap-1.5 h-7 px-2 text-xs', className)} 
            onClick={handleClick} 
            onMouseEnter={(e) => { setHovered(true); props.onMouseEnter?.(e); }}
            onMouseLeave={(e) => { setHovered(false); props.onMouseLeave?.(e); }}
            {...props}
        >
            {CustomAnimatedIcon ? (
                <CustomAnimatedIcon isAnimating={clicked || hovered} className="size-3.5" />
            ) : (
                <motion.div
                    animate={{ 
                        scale: (clicked || hovered) ? 1.15 : 1,
                        rotate: (clicked || hovered) ? ((Icon as any).displayName === 'Wand2' || (Icon as any).displayName === 'Shuffle' ? 10 : 0) : 0
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="flex items-center justify-center"
                >
                    <Icon className="size-3.5" />
                </motion.div>
            )}
            {label && <span>{label}</span>}
        </Button>
    );

    if (size === "icon" || tooltipText) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent>
                    {clicked ? "Done!" : tooltipText}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
