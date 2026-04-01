import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/providers";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LANDING_URL } from "@/lib/config";

import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroDraft",
  description: "Brain-tested ad analysis with TRIBE v2-calibrated neural predictions."
};

export default function RootLayout(props: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-base)]">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <a href={LANDING_URL} className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_20px_rgba(0,255,136,0.35)]" />
              <span className="text-sm font-medium tracking-tight text-[var(--text-primary)]">NeuroDraft</span>
            </a>

            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/analyze">Open workspace</Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
}
