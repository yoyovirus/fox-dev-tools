"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@radix-ui/react-icons";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background radial gradient */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15)_0%,_transparent_70%)] opacity-50 dark:opacity-100" />

            <div className="text-center max-w-[600px] relative z-10">
                <h1 className="text-[6rem] sm:text-[8rem] md:text-[10rem] font-black leading-none mb-4 bg-gradient-to-br from-primary to-pink-600 bg-clip-text text-transparent">
                    404
                </h1>

                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    Page Not Found
                </h2>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    <br />
                    Let&apos;s get you back on track.
                </p>

                <Button asChild size="lg" className="px-8 font-semibold">
                    <Link href="/">
                        <HomeIcon className="mr-2 size-5" />
                        Go Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
