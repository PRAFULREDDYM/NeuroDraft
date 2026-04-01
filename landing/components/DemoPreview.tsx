"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BrainCircuit, Gauge, Search } from "lucide-react";
import { APP_URL } from "@/lib/config";

const scenes = [
  { label: "Scene 01 · 0-6s", score: 68, tag: "Moderate", tone: "text-[var(--text-primary)]", active: false },
  { label: "Scene 02 · 6-14s", score: 73, tag: "Strong", tone: "text-[var(--text-primary)]", active: false },
  { label: "Scene 03 · 14-22s", score: 57, tag: "Attention drop", tone: "text-red-400", active: true },
  { label: "Scene 04 · 22-30s", score: 79, tag: "Memory spike", tone: "text-[var(--text-primary)]", active: false }
] as const;

function MetricLine(): React.JSX.Element {
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full">
      <polyline
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="2"
        points="10,58 80,44 150,82 230,30"
      />
      {[
        [10, 58],
        [80, 44],
        [150, 82],
        [230, 30]
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#0ea5e9" />
      ))}
    </svg>
  );
}

export function DemoPreview(): React.JSX.Element {
  return (
    <section className="section-pad">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--accent-primary)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            LIVE DEMO
          </motion.p>
          <motion.h2
            className="mt-4 text-[clamp(36px,4vw,56px)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.04 }}
          >
            This is what your output looks like.
          </motion.h2>
        </div>

        <motion.div
          className="mx-auto mt-14 max-w-[900px] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid gap-6 lg:grid-cols-[0.3fr_0.4fr_0.3fr]">
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-soft)]">Scene list</p>
              {scenes.map((scene) => (
                <div
                  key={scene.label}
                  className={`rounded-[14px] border border-[var(--border)] px-4 py-3 ${
                    scene.active ? "border-l-2 border-l-red-500 bg-[var(--page-bg)]" : "bg-[var(--surface-sunken)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{scene.label}</p>
                      <span className={`mt-1 inline-flex rounded-full bg-[var(--accent-muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-primary)]`}>
                        {scene.tag}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{scene.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[18px] border border-[var(--border)] bg-[var(--page-bg)] p-5">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-soft)]">Overall engagement arc</p>
              <div className="mt-4 h-[160px]">
                <MetricLine />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-soft)]">
                <span>68</span>
                <span>73</span>
                <span>57</span>
                <span>79</span>
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--border)] bg-[var(--page-bg)] p-5">
              <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-soft)]">
                <BrainCircuit className="h-4 w-4 text-[var(--accent-primary)]" />
                Scene 3 - Attention drop
              </p>
              <div className="mt-4 border-l-2 border-red-500 pl-4">
                <p className="text-sm leading-6 text-slate-300">
                  Fast transition loses the viewer. Memory encoding drops to 57%.
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Add a 1-second hold on the product before the cut. Recall improves.
                </p>
              </div>

              <div className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Gauge className="h-4 w-4 text-[var(--accent-primary)]" />
                  Neural grade: A
                  <ArrowUpRight className="h-4 w-4 text-[var(--accent-primary)]" />
                </p>
                <p className="mt-2 text-sm text-[var(--text-soft)]">85th percentile</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href={`${APP_URL}/analyze`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-primary)] px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Try it free →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default DemoPreview;
