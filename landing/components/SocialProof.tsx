"use client";

import { useRef } from "react";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";

const items = [
  {
    title: "Agency",
    quote: "We use NeuroDraft to kill weak hooks before the client room. It is faster than a focus group and cleaner than a spreadsheet.",
    detail: "Creative teams get a neural scorecard plus rewrites they can actually act on.",
    tag: "Concept testing"
  },
  {
    title: "In-house Brand",
    quote: "The heatmap makes the tradeoff obvious: where the story gets emotional, where recall drops, and where the product needs to appear.",
    detail: "Brand teams can compare several concepts before committing production budget.",
    tag: "Launch planning"
  },
  {
    title: "Startup",
    quote: "We do not have time for expensive testing cycles. NeuroDraft gives us a strong directional read from a script alone.",
    detail: "Founders can pressure-test messaging long before a shoot is booked.",
    tag: "Fast validation"
  }
] as const;

function TiltCard({
  title,
  quote,
  detail,
  tag,
  index
}: Readonly<{
  title: string;
  quote: string;
  detail: string;
  tag: string;
  index: number;
}>): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 140, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 140, damping: 18 });
  const glow = useTransform(rotateX, [-16, 0, 16], [0.08, 0.2, 0.08]);

  return (
    <motion.article
      ref={cardRef}
      className="tilt-shell relative rounded-[2rem] border border-[var(--border)] bg-[var(--surface-alt)] p-6 transition-colors duration-300 hover:border-[var(--accent-primary)]"
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 1000 }}
      onMouseMove={(event) => {
        const bounds = cardRef.current?.getBoundingClientRect();

        if (!bounds) {
          return;
        }

        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateX.set(-y * 8);
        rotateY.set(x * 8);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ scale: 1.01 }}
    >
      <motion.div
        className="tilt-inner pointer-events-none absolute inset-0 rounded-[2rem] border border-white/5"
        style={{ opacity: glow }}
      />
      <div className="relative">
        <p className="section-label">{title}</p>
        <p className="mt-5 text-lg leading-8 text-[var(--text-primary)]">{quote}</p>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{detail}</p>
        <div className="mt-6 inline-flex rounded-full border border-[var(--border-strong)] bg-black/60 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
          {tag}
        </div>
      </div>
    </motion.article>
  );
}

export function SocialProof(): React.JSX.Element {
  return (
    <section id="proof" className="relative flex min-h-screen flex-col justify-center overflow-hidden snap-start snap-always py-12 lg:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Who it is for"
          title="Built for teams who want more signal before the spend."
          description="The landing page now mirrors the product story: the cards feel physical, and the workflow feels like a real analysis room."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {items.map((item, index) => (
            <TiltCard key={item.title} title={item.title} quote={item.quote} detail={item.detail} tag={item.tag} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
