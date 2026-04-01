"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "$800B", label: "spent on ads globally each year" },
  { value: "60%", label: "of ads fail to encode in memory" },
  { value: "$80K", label: "what one neuromarketing study costs" }
] as const;

export function ProblemSection(): React.JSX.Element {
  return (
    <section id="problem" className="section-pad">
      <motion.div
        className="mx-auto max-w-7xl rounded-[20px] border border-[var(--border)] bg-[var(--surface-alt)] px-6 py-8 md:px-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        <div className="grid gap-6 md:grid-cols-3 md:items-center md:gap-0">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-0 md:gap-6">
              <div className="min-w-0">
                <p className="text-[48px] font-bold leading-none text-[var(--text-primary)]">{stat.value}</p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--text-soft)]">{stat.label}</p>
              </div>
              {index < stats.length - 1 ? <div className="hidden h-12 w-px bg-[var(--border)] md:block" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default ProblemSection;
