"use client";

import { motion } from "framer-motion";
import { FileText, Film, Brain, Sparkles, type LucideIcon } from "lucide-react";
import Image from "next/image";

type Step = {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  {
    num: "01",
    title: "Paste your script",
    desc: "Drop in your ad brief, voiceover lines, or scene description. The LLaMA 3.2 text encoder breaks it into semantic chunks.",
    icon: FileText
  },
  {
    num: "02",
    title: "Trimodal pipeline runs",
    desc: "Script expansion, scene direction, and visual synthesis run concurrently via V-JEPA2 and Wav2Vec-BERT.",
    icon: Film
  },
  {
    num: "03",
    title: "TRIBE v2 mapping",
    desc: "The pipeline maps the latent space into 70,000 cortical voxels calibrated to Meta's performance-driven attention testing.",
    icon: Brain
  },
  {
    num: "04",
    title: "Get your neural brief",
    desc: "A grade, six timeline charts, five distinct neuro-metrics, and rewrite suggestions for the weakest scene are generated instantly.",
    icon: Sparkles
  }
];

export function HowItWorks(): React.JSX.Element {
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
            THE PROCESS
          </motion.p>
          <motion.h2
            className="mt-4 text-[clamp(36px,4vw,56px)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.04 }}
          >
            From script to neural readout in four steps.
          </motion.h2>
        </div>

        <div className="mt-14 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          <div className="flex-1 w-full">
            <div className="grid gap-6 sm:grid-cols-2">
              {steps.map((step, index) => (
                <motion.div
                  key={step.num}
                  className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5 lg:p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="flex items-start gap-4 flex-col">
                    <div className="flex items-center gap-3 w-full border-b border-[var(--border)] pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent-primary)] text-xs font-semibold text-[var(--text-primary)] bg-black/50">
                        {step.num}
                      </div>
                      <h3 className="text-[15px] font-medium tracking-tight text-[var(--text-primary)]">{step.title}</h3>
                      <step.icon className="h-4 w-4 text-[var(--accent-primary)] ml-auto" />
                    </div>
                    <p className="mt-1 text-[13px] leading-[1.7] text-[var(--text-muted)]">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-sunken)] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--page-bg)] to-transparent opacity-60 z-10 pointer-events-none" />
              <Image src="/images/script.png" alt="AI Script Analysis" fill className="object-cover opacity-90 transition-transform duration-700 hover:scale-105" />
            </div>
          </motion.div>
        </div>

        <div className="mt-16">
          <motion.div
            className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {[
              "Script Expander",
              "Scene Director",
              "Video Synthesizer",
              "Transcript Builder",
              "TRIBE Predictor",
              "Insight Writer"
            ].map((pill) => (
              <span key={pill} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[12px] text-[var(--text-soft)]">
                {pill}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
