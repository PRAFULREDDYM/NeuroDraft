"use client";

import { useEffect, useRef, useState } from "react";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";

const segments = [
  {
    label: "Scene 01",
    time: "0-6s",
    visual: 0.72,
    auditory: 0.63,
    attention: 0.71,
    emotional: 0.66,
    memory: 0.58,
    overall: 0.68,
    note: "Opening frame establishes the product cue and a confident emotional tone."
  },
  {
    label: "Scene 02",
    time: "6-14s",
    visual: 0.67,
    auditory: 0.69,
    attention: 0.76,
    emotional: 0.8,
    memory: 0.64,
    overall: 0.73,
    note: "The product reveal lands cleanly with strong audio congruence."
  },
  {
    label: "Scene 03",
    time: "14-22s",
    visual: 0.6,
    auditory: 0.58,
    attention: 0.62,
    emotional: 0.57,
    memory: 0.49,
    overall: 0.57,
    note: "Fast transition softens memory encoding and deserves a tighter beat."
  },
  {
    label: "Scene 04",
    time: "22-30s",
    visual: 0.8,
    auditory: 0.71,
    attention: 0.83,
    emotional: 0.77,
    memory: 0.74,
    overall: 0.79,
    note: "The closing brand line and final frame produce the strongest recall spike."
  }
] as const;

const metrics = [
  { label: "Visual cortex", color: "var(--neural-visual)" },
  { label: "Auditory cortex", color: "var(--neural-auditory)" },
  { label: "Prefrontal attention", color: "var(--neural-attention)" },
  { label: "Amygdala arousal", color: "var(--neural-emotional)" },
  { label: "Memory encoding", color: "var(--neural-memory)" },
  { label: "Overall engagement", color: "var(--neural-overall)" }
] as const;

function getScoreColor(score: number): string {
  if (score >= 0.7) {
    return "#22c55e";
  }

  if (score >= 0.5) {
    return "#f59e0b";
  }

  return "#ef4444";
}

function ScoreValue({
  target
}: Readonly<{
  target: number;
}>): React.JSX.Element {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 26 });
  const value = useTransform(spring, (latest) => Math.round(latest * 100));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const unsubscribe = value.on("change", (latest) => {
      setDisplay(String(latest));
    });

    return unsubscribe;
  }, [value]);

  useEffect(() => {
    motionValue.set(target);
  }, [motionValue, target]);

  return <span className="mono text-lg font-medium text-[var(--text-primary)]">{display}</span>;
}

function ChartRow({
  label,
  color,
  values,
  activeScene,
  hoveredScene
}: Readonly<{
  label: string;
  color: string;
  values: readonly number[];
  activeScene: number;
  hoveredScene: number | null;
}>): React.JSX.Element {
  const width = 360;
  const height = 72;
  const step = width / Math.max(1, values.length - 1);
  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - value * 56 - 6;
      return `${x},${y}`;
    })
    .join(" ");

  const highlightIndex = hoveredScene ?? activeScene;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-primary)]">{label}</span>
        <span className="text-[var(--text-secondary)]">{Math.round(values[highlightIndex] * 100)}%</span>
      </div>
      <div className="relative overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-black/40 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          <motion.polyline
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 1.35, ease: "easeInOut" }}
            opacity={0.24}
          />

          {values.map((value, index) => {
            const x = index * step;
            const y = height - value * 56 - 6;
            const isActive = index === highlightIndex;

            return (
              <motion.circle
                key={`${label}-${index}`}
                cx={x}
                cy={y}
                r={isActive ? 4.8 : 2.6}
                fill={color}
                opacity={isActive ? 1 : 0.35}
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.55 }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function SceneCard({
  segment,
  index,
  active,
  onHover
}: Readonly<{
  segment: (typeof segments)[number];
  index: number;
  active: boolean;
  onHover: (index: number | null) => void;
}>): React.JSX.Element {
  const borderColor = getScoreColor(segment.overall);

  return (
    <motion.button
      type="button"
      className={`w-full rounded-[1.5rem] border bg-[var(--surface-alt)] p-4 text-left transition-colors duration-200 ${
        active ? "border-[var(--accent-primary)]" : "border-[var(--border)]"
      }`}
      onMouseEnter={() => onHover(index)}
      onFocus={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onBlur={() => onHover(null)}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">{segment.label}</p>
          <p className="text-xs text-[var(--text-secondary)]">{segment.time}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Scene score</p>
          <ScoreValue target={segment.overall} />
        </div>
      </div>
      <div className="mt-4 h-px w-full" style={{ background: borderColor }} />
      <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{segment.note}</p>
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/50 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
        {segment.overall >= 0.7 ? "Strong moment" : segment.overall < 0.5 ? "Attention drop" : "Moderate engagement"}
      </div>
    </motion.button>
  );
}

export function PipelineScroll(): React.JSX.Element {
  const [activeScene, setActiveScene] = useState(0);
  const [hoveredScene, setHoveredScene] = useState<number | null>(null);

  useEffect(() => {
    if (hoveredScene !== null) return;
    
    const interval = setInterval(() => {
      setActiveScene((current) => (current + 1) % segments.length);
    }, 2800);
    
    return () => clearInterval(interval);
  }, [hoveredScene]);

  const visibleScene = hoveredScene ?? activeScene;

  return (
    <section id="pipeline" className="relative flex min-h-screen flex-col justify-center overflow-hidden snap-start snap-always py-12 lg:py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Pipeline demo"
          title="A storyboard rail that turns motion into measurable signal."
          description="The timeline, the score lines, and the scene cards all move together as if you were inside the analysis workspace."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            {segments.map((segment, index) => (
              <SceneCard
                key={segment.label}
                segment={segment}
                index={index}
                active={visibleScene === index}
                onHover={setHoveredScene}
              />
            ))}
          </div>

          <div className="relative rounded-[2rem] border border-[var(--border)] bg-[var(--surface-alt)] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Heatmap teaser</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Hover a scene card to focus the matching point across every metric.</p>
              </div>
              <span className="rounded-full border border-[var(--border-strong)] bg-black/70 px-3 py-1 text-xs text-[var(--text-secondary)]">
                Active {visibleScene + 1}
              </span>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-black/60 p-4">
              <div className="relative h-8 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[var(--accent-primary)]"
                  style={{ width: `calc(${(visibleScene / Math.max(1, segments.length - 1)) * 100}% + 1px)` }}
                />
                <motion.div
                  className="absolute top-1/2 h-5 w-px -translate-y-1/2 bg-[var(--accent-primary)]"
                  style={{ left: `calc(${(visibleScene / Math.max(1, segments.length - 1)) * 100}% - 1px)` }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {metrics.map((metric, metricIndex) => {
                const values = segments.map((segment) => {
                  const row = [segment.visual, segment.auditory, segment.attention, segment.emotional, segment.memory, segment.overall];
                  return row[metricIndex];
                });

                return (
                  <ChartRow
                    key={metric.label}
                    label={metric.label}
                    color={metric.color}
                    values={values}
                    activeScene={activeScene}
                    hoveredScene={hoveredScene}
                  />
                );
              })}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-black/50 p-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">Scene insight</p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                {segments[visibleScene].note} The strongest fix is usually a clearer product cue plus one slower beat before the cut.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
