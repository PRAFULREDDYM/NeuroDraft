"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen neuro-grid">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-black/40">
              <Brain className="h-5 w-5 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium">NeuroDraft</p>
              <p className="text-xs text-[var(--text-muted)]">TRIBE v2-calibrated ad intelligence</p>
            </div>
          </div>
          <Badge variant="outline">Launch workspace</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Badge variant="outline">Know how the brain reacts before you spend a dollar</Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="max-w-4xl text-5xl font-medium tracking-tight text-[var(--text-primary)] md:text-6xl"
            >
              Brain-tested ad analysis for teams that want sharper creative, faster.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)]"
            >
              Paste a script, run the live pipeline, and inspect neural heatmaps, scene previews, and rewrite suggestions in one workspace.
            </motion.p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/analyze">
                  Open analysis workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/results/demo">
                  View sample results
                </Link>
              </Button>
            </div>
          </div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.12 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="space-y-4 pt-6">
                  <Card className="border-border bg-black/50">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Live pipeline</p>
                        <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
                      </div>
                      <div className="space-y-3">
                        <Card className="border-border bg-white/5">
                          <CardContent className="px-4 py-3 text-sm">Script expansion</CardContent>
                        </Card>
                        <Card className="border-border bg-white/5">
                          <CardContent className="px-4 py-3 text-sm">Scene planning</CardContent>
                        </Card>
                        <Card className="border-border bg-white/5">
                          <CardContent className="px-4 py-3 text-sm">Neural prediction</CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-border bg-black/30">
                      <CardContent className="pt-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Preview</p>
                        <p className="mt-2 text-sm text-[var(--text-primary)]">Scene previews and neural cues from your script</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-black/30">
                      <CardContent className="pt-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Output</p>
                        <p className="mt-2 text-sm text-[var(--text-primary)]">Heatmap plus rewrite guidance</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Input", value: "Paste a script", note: "Text-only or video-backed analysis" },
            { label: "Compute", value: "Live pipeline", note: "7 coordinated steps with live progress updates" },
            { label: "Output", value: "Neural insights", note: "Heatmaps, grades, and fixes" }
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{item.label}</p>
                <p className="mt-2 text-lg font-medium text-[var(--text-primary)]">{item.value}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
