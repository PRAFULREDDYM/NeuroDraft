"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Upload } from "lucide-react";

import { HeroAppMockup } from "@/components/HeroAppMockup";
import { APP_URL } from "@/lib/config";

const words = ["Most ads are", "gut feel", "dressed up."];

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const wordMotion = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const linkMotion = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export function Hero(): React.JSX.Element {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] pb-20 pt-16">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 top-0 h-[600px] w-full bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,var(--accent-muted),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.04),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.04),transparent_40%)] pointer-events-none" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-start px-6 pt-24 text-center">
        
        <motion.div
          variants={linkMotion}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)] shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Meta TRIBE v2 · Open source model
        </motion.div>

        <motion.h1
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto mt-8 max-w-4xl text-[clamp(44px,6vw,72px)] font-bold leading-[1.05] tracking-tight text-[var(--text-primary)]"
        >
          {words.map((word, index) => (
            <motion.span key={word} variants={wordMotion} className="inline-block whitespace-pre">
              {index === 2 ? (
                <span className="text-[var(--accent-primary)]">dressed up. </span>
              ) : (
                word + " "
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          variants={linkMotion}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.35 }}
          className="mx-auto mt-6 max-w-[640px] text-[18px] leading-[1.7] text-[var(--text-muted)]"
        >
          You brief the team. You approve the script. You book the shoot.
          <br className="hidden sm:block" />
          Then you find out it doesn't land. NeuroDraft tells you before any of that happens.
        </motion.p>

        {/* Interactive "Paste your script" Input Container */}
        <motion.div
          variants={linkMotion}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
          className="mt-12 w-full max-w-[720px]"
        >
          <div className="group relative flex w-full flex-col sm:flex-row items-center gap-2 sm:gap-0 rounded-[18px] border border-[var(--border-strong)] bg-[var(--surface-sunken)] p-2 shadow-xl ring-1 ring-[var(--border)] transition-all focus-within:ring-[var(--accent-primary)]">
            <div className="flex w-full min-w-0 items-center">
              <div className="flex h-12 w-14 items-center justify-center text-[var(--text-soft)]">
                <FileText className="h-5 w-5" />
              </div>
              <input 
                type="text"
                placeholder="Paste your ad brief, video script, or scene to run an analysis..." 
                className="h-12 w-full truncate bg-transparent px-2 text-[15px] outline-none placeholder:text-[var(--text-faint)] text-[var(--text-primary)]"
              />
            </div>
            <a
              href={`${APP_URL}/analyze`}
              className="flex w-full sm:w-auto items-center justify-center whitespace-nowrap rounded-[12px] bg-[var(--accent-primary)] px-8 py-3.5 text-[14px] font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Analyze your script free <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
          
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] font-medium text-[var(--text-faint)]">
            <span className="flex items-center gap-1.5"><Upload className="h-4 w-4" /> PDF, DOCX, TXT supported</span>
            <span>✓ No credit card required</span>
            <span>✓ 30-second turnaround</span>
          </div>

          <button
            type="button"
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-6 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            See how it works ↓
          </button>
        </motion.div>

        {/* App Dashboard Mockup */}
        <HeroAppMockup />

      </div>
    </section>
  );
}
