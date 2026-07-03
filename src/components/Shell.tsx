"use client";

import React from "react";
import { AppThemeProvider, useThemeContext } from "@/components/AppThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

import { CommandMenu } from "@/components/CommandMenu";

function Header() {
    const { mode, toggleColorMode } = useThemeContext();
    const pathname = usePathname();
    
    // Extract tool name from pathname if applicable
    const isTool = pathname.includes("-tools/");
    const toolName = isTool ? pathname.split("/").pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : "Dashboard";

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{toolName}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            
            <div className="flex items-center gap-4">
                <CommandMenu />
                <Button variant="ghost" size="icon" onClick={toggleColorMode}>
                    {mode === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                </Button>
            </div>
        </header>
    );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <AppThemeProvider>
            <ErrorBoundary>
                <LayoutContent>{children}</LayoutContent>
            </ErrorBoundary>
        </AppThemeProvider>
    );
}
