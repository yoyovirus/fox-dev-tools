import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedIconProps extends React.SVGProps<SVGSVGElement> {
    isAnimating?: boolean;
}

export function AnimatedDownload({ isAnimating, className, ...props }: AnimatedIconProps) {
    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(className)}
            {...props as any}
        >
            <motion.g
                animate={{ y: isAnimating ? [0, 3, 0] : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                <path d="M12 15V3" />
                <path d="m7 10 5 5 5-5" />
            </motion.g>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        </motion.svg>
    );
}

export function AnimatedTrash({ isAnimating, className, ...props }: AnimatedIconProps) {
    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(className)}
            {...props as any}
        >
            <motion.g
                animate={{ y: isAnimating ? -2 : 0, rotate: isAnimating ? -5 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <path d="M3 6h18" />
            </motion.g>
            <motion.path
                d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                animate={{ y: isAnimating ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />
            <motion.line
                x1={10} x2={10} y1={11} y2={17}
                animate={{ y: isAnimating ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />
            <motion.line
                x1={14} x2={14} y1={11} y2={17}
                animate={{ y: isAnimating ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />
        </motion.svg>
    );
}

export function AnimatedRefresh({ isAnimating, className, ...props }: AnimatedIconProps) {
    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(className)}
            animate={{ rotate: isAnimating ? 360 : 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 25 }}
            {...props as any}
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
        </motion.svg>
    );
}

export function AnimatedFileText({ isAnimating, className, ...props }: AnimatedIconProps) {
    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(className)}
            {...props as any}
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <motion.path
                d="M10 9H8"
                animate={{ pathLength: isAnimating ? [0, 1] : 1, opacity: isAnimating ? [0, 1] : 1 }}
                transition={{ duration: 0.3 }}
            />
            <motion.path
                d="M16 13H8"
                animate={{ pathLength: isAnimating ? [0, 1] : 1, opacity: isAnimating ? [0, 1] : 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            />
            <motion.path
                d="M16 17H8"
                animate={{ pathLength: isAnimating ? [0, 1] : 1, opacity: isAnimating ? [0, 1] : 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            />
        </motion.svg>
    );
}

export function AnimatedCopy({ isAnimating, className, ...props }: AnimatedIconProps) {
    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(className)}
            {...props as any}
        >
            <motion.rect
                width={14}
                height={14}
                x={8}
                y={8}
                rx={2}
                ry={2}
                animate={{ y: isAnimating ? -2 : 0, x: isAnimating ? -2 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.path
                d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                animate={{ y: isAnimating ? 2 : 0, x: isAnimating ? 2 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
        </motion.svg>
    );
}
