"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { APP_URL } from "@/lib/config";

export function CTA(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const headlineWords = useMemo(() => ["Your", "next", "campaign.", "Brain-tested."], []);

  return (
    <section className="relative bg-[var(--black-swap)] py-[120px]">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h2
            className="headline text-[clamp(48px,6vw,96px)] font-bold leading-none tracking-tight text-[var(--text-primary)]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } }
            }}
          >
            <span className="block">
              {headlineWords.slice(0, 3).map((word) => (
                <motion.span
                  key={word}
                  className="mr-[0.25em] inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {headlineWords.slice(3).map((word) => (
                <motion.span
                  key={word}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h2>
          <p className="mt-4 text-lg leading-8 text-[var(--text-soft)]">
            No credit card. No lab study. Paste a script and get your readout.
          </p>

          <form
            className="mx-auto mt-10 flex w-full max-w-[480px] items-center gap-3 rounded-full border border-[var(--border-strong)] bg-transparent p-2"
            onSubmit={(event) => {
              event.preventDefault();
              console.log("[NeuroDraft CTA]", email);
              setSubmitted(true);
            }}
          >
            <input
              type="email"
              aria-label="Email address"
              placeholder="you@brand.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 flex-1 rounded-full bg-transparent px-4 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-soft)]"
            />
            <motion.a
              href={`${APP_URL}/analyze`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-primary)] px-6 text-sm font-semibold text-black transition-transform hover:scale-105"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Get free access <ArrowRight className="ml-2 h-4 w-4" />
            </motion.a>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-[13px] text-[var(--text-soft)]">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">No credit card</span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">30 second readout</span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">Free tier available</span>
          </div>

          {submitted ? (
            <p className="mt-4 text-sm text-[var(--accent-primary)]">You're on the list.</p>
          ) : null}
        </motion.div>

        <footer className="mt-20 border-t border-[var(--border)] pt-6 text-sm text-[var(--border-strong)]">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <p className="text-base font-medium text-[var(--text-primary)]">NeuroDraft</p>
              <p>Built on TRIBE v2 (Meta Research, 2025)</p>
            </div>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)]"
            >
              Open app →
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
