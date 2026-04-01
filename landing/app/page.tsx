"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { CTA } from "@/components/CTA";
import { DemoPreview } from "@/components/DemoPreview";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SmoothScroll } from "@/components/SmoothScroll";
import { APP_URL } from "@/lib/config";

function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function Nav(): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = (): void => {
      setScrolled(window.scrollY > 50);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <motion.header
      className="fixed left-0 top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-10"
      animate={{
        backgroundColor: scrolled ? "rgba(0,0,0,0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
        borderBottomColor: scrolled ? "var(--border)" : "transparent",
        opacity: scrolled ? 0.98 : 1
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-transparent px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)]" aria-hidden="true" />
          <span className="text-sm font-medium tracking-tight text-[var(--text-primary)]">NeuroDraft</span>
        </div>

        <div className="hidden items-center gap-6 text-sm text-[var(--text-muted)] md:flex">
          <button type="button" onClick={() => scrollToSection("problem")} className="transition-colors hover:text-[var(--text-primary)]">
            Problem
          </button>
          <button type="button" onClick={() => scrollToSection("how-it-works")} className="transition-colors hover:text-[var(--text-primary)]">
            How it works
          </button>
          <a
            href={`${APP_URL}/analyze`}
            className="rounded-full bg-[var(--accent-primary)] px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            Open app →
          </a>
        </div>
      </div>
    </motion.header>
  );
}

export default function Page(): React.JSX.Element {
  return (
    <SmoothScroll>
      <main className="min-h-screen w-full bg-[var(--page-bg)]">
        <Nav />
        <section id="hero">
          <Hero />
        </section>
        <section id="problem">
          <Features />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="demo">
          <DemoPreview />
        </section>
        <section id="access">
          <CTA />
        </section>
      </main>
    </SmoothScroll>
  );
}
