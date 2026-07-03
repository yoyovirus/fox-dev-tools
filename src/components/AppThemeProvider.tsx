"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
    mode: ThemeMode;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: "dark",
    toggleColorMode: () => {},
});

export function useThemeContext() {
    return useContext(ThemeContext);
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("dark");

    // Read saved preference on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("fox-theme") as ThemeMode | null;
            if (saved === "light" || saved === "dark") {
                setMode(saved);
                document.documentElement.classList.toggle("dark", saved === "dark");
            }
        } catch {
            // localStorage not available
        }
    }, []);

    const toggleColorMode = useCallback(() => {
        setMode((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            document.documentElement.classList.toggle("dark", next === "dark");
            try {
                localStorage.setItem("fox-theme", next);
            } catch {
                // localStorage not available
            }
            return next;
        });
    }, []);

    return (
        <ThemeContext value={{ mode, toggleColorMode }}>
            {children}
        </ThemeContext>
    );
}
