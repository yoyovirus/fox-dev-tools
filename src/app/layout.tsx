import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL('https://fox-dev-tools.vercel.app'),
  title: {
    default: "FoX Dev Tools - Tools for Developers",
    template: "%s | FoX Dev Tools"
  },
  description: "A fast, privacy-first suite of developer tools. Format, validate, convert, and visualize data right in your browser.",
  keywords: ["developer tools", "JSON formatter", "Base64 encoder", "privacy-first tools", "local tools"],
  authors: [{ name: "Rahul Khedekar" }],
  creator: "Rahul Khedekar",
  openGraph: {
    title: "FoX Dev Tools - Local Developer Tools",
    description: "Zero backend, 100% private developer tools. Run formatting and validations instantly in your browser.",
    url: "https://fox-dev-tools.vercel.app",
    siteName: "FoX Dev Tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoX Dev Tools",
    description: "Fast, privacy-first tools for developers.",
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    title: "FoX Dev Tools",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark", geistSans.variable, geistMono.variable)}
    >
      <body className="font-sans antialiased">
        <TooltipProvider delayDuration={200}>
          <Shell>{children}</Shell>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
