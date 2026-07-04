"use client";

import React from "react";
import { AppThemeProvider, useThemeContext } from "@/components/AppThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon, HomeIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { CommandMenu } from "@/components/CommandMenu";

function Header() {
    const { mode, toggleColorMode } = useThemeContext();
    const pathname = usePathname();
    
    const pathSegments = pathname.split('/').filter(Boolean).filter(s => s !== 'en');
    
    let breadcrumbs: Array<{ label: React.ReactNode; isCurrent?: boolean; href?: string; id: string }> = [];
    if (pathSegments.length === 0) {
        breadcrumbs = [{ label: <HomeIcon className="size-4" />, isCurrent: true, id: 'home' }];
    } else {
        breadcrumbs.push({ label: <HomeIcon className="size-4" />, href: '/', id: 'home' });
        
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            const isLast = i === pathSegments.length - 1;
            
            // Format segment name
            let name = segment.split('-').map(w => 
                w.toLowerCase() === 'json' ? 'JSON' : 
                w.toLowerCase() === 'base64' ? 'Base64' : 
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
            
            // Special cases
            if (segment === 'base64-encoder-decoder') {
                name = 'Base64 Encoder / Decoder';
            }
            
            breadcrumbs.push({ 
                label: name, 
                isCurrent: isLast,
                href: isLast ? undefined : (i === 0 && pathSegments.length > 1) ? undefined : `/${pathSegments.slice(0, i + 1).join('/')}`,
                id: name
            });
        }
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.id + "-" + index}>
                                <BreadcrumbItem>
                                    {crumb.isCurrent ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : crumb.href ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <span className="text-muted-foreground transition-colors hover:text-foreground">{crumb.label}</span>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
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
    const pathname = usePathname();
    const isHome = pathname === '/';
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <Header />
                <main className={`flex-1 overflow-auto bg-background p-4 md:p-6 ${isHome ? 'snap-y snap-mandatory' : ''}`}>
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
