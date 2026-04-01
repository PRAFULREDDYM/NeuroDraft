"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  BarChart3,
  Brain,
  Eye,
  PencilLine,
  Sparkles,
  type LucideIcon,
  type LucideProps,
  Type
} from "lucide-react";
import Image from "next/image";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { ParallaxImage } from "@/components/ui/ParallaxImage";

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
};

type UseCaseCard = {
  badge: string;
  pain: string;
  fix: string;
  tag: string;
};

const features: FeatureCard[] = [
  {
    icon: Sparkles,
    title: "30-second readout",
    body: "Paste your script. Every analysis step runs in parallel. You have scores before the next meeting starts.",
    tag: "Speed"
  },
  {
    icon: Brain,
    title: "Scene-by-scene scores",
    body: "Know exactly which 6 seconds lose the viewer, which frame spikes recall, and why.",
    tag: "Precision"
  },
  {
    icon: Type,
    title: "Script-only input",
    body: "No video needed. Our pipeline synthesizes a scene model from your script alone. Upload footage for higher accuracy.",
    tag: "Flexible"
  },
  {
    icon: BarChart3,
    title: "6 neural metrics",
    body: "Visual attention, sound impact, conscious focus, emotional response, memory strength, and overall engagement - all scored.",
    tag: "Depth"
  },
  {
    icon: PencilLine,
    title: "Rewrite suggestions",
    body: "The weakest scene gets a concrete rewrite. Side-by-side before/after so the creative team knows what to change.",
    tag: "Actionable"
  },
  {
    icon: ArrowLeftRight,
    title: "Headline recall test",
    body: "Three alternative headlines ranked by predicted memory encoding. Ship the one that sticks.",
    tag: "Testing"
  }
];

const compareRows = [
  ["Time to results", "30 seconds", "4-8 weeks"],
  ["Cost", "Free tier", "$50,000-$200,000"],
  ["Input required", "A script", "Finished video + 30 subjects"],
  ["Scenes analyzed", "All of them", "Researcher-selected clips"],
  ["Rewrite guidance", "Included", "Separate consulting fee"],
  ["Iterations", "Unlimited", "One study, one result"]
] as const;

const useCases: UseCaseCard[] = [
  {
    badge: "AGENCY",
    pain: "Your client wants certainty. You have gut feel.",
    fix: "NeuroDraft gives you a neural scorecard to walk into the room with.",
    tag: "Concept testing"
  },
  {
    badge: "IN-HOUSE BRAND",
    pain: "Production is booked. You don't know if it'll land.",
    fix: "Run the script through NeuroDraft before the shoot date.",
    tag: "Launch planning"
  },
  {
    badge: "STARTUP FOUNDER",
    pain: "No budget for a focus group. You ship and hope.",
    fix: "Thirty seconds. A grade. Five things to fix. Ship with confidence.",
    tag: "Fast validation"
  }
];

function SectionHeading(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <motion.p
        className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--accent-primary)]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        WHAT YOU GET
      </motion.p>
      <AnimatedText
        el="h2"
        className="mt-4 text-[clamp(36px,4vw,56px)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]"
        text="Everything a neuromarketing lab gives you. In 30 seconds. For free."
      />
      <motion.p
        className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[var(--text-secondary)]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.08 }}
      >
        NeuroDraft runs your script through a TRIBE v2-calibrated prediction pipeline built to mirror the research architecture behind Meta's large-scale brain-response studies.
      </motion.p>
    </div>
  );
}

function StatDivider(): React.JSX.Element {
  return <div className="hidden h-12 w-px bg-[var(--border)] md:block" aria-hidden="true" />;
}

function ProblemBar(): React.JSX.Element {
  const stats = [
    { value: "$800B", label: "spent on ads globally each year" },
    { value: "60%", label: "of ads fail to encode in memory" },
    { value: "$80K", label: "what one neuromarketing study costs" }
  ];

  return (
    <motion.section
      className="w-full bg-[var(--surface-alt)] px-6 py-8 md:px-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
    >
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3 md:items-center md:gap-0">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center gap-0 md:gap-6">
            <div className="min-w-0">
              <p className="text-[48px] font-bold leading-none text-[var(--text-primary)]">{stat.value}</p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--text-soft)]">{stat.label}</p>
            </div>
            {index < stats.length - 1 ? <StatDivider /> : null}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function FeatureIcon(props: LucideProps & { icon: LucideIcon }): React.JSX.Element {
  const { icon: Icon, ...rest } = props;
  return <Icon {...rest} />;
}

function BentoFeatureGrid(): React.JSX.Element {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full">
      {features.map((feature, index) => {
        let spanClass = "col-span-1";
        if (index === 0) spanClass = "sm:col-span-2 lg:col-span-2";
        if (index === 3) spanClass = "sm:col-span-2 lg:col-span-2";
        if (index === 5) spanClass = "sm:col-span-2 lg:col-span-3";

        return (
          <motion.article
            key={feature.title}
            className={`group relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-sunken)] p-8 transition-colors duration-200 hover:border-[var(--accent-primary)] flex flex-col ${spanClass} min-h-[300px] shadow-sm hover:shadow-lg hover:shadow-[var(--accent-muted)]`}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <div className="absolute right-6 top-6 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)] shadow-sm z-20">
              {feature.tag}
            </div>
            
            {(index === 0 || index === 3 || index === 5) && (
              <div className="absolute right-0 bottom-0 top-0 w-1/2 z-0 bg-gradient-to-l from-[var(--surface-deep)] to-transparent mix-blend-overlay" />
            )}

            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-[16px] border border-[var(--border-strong)] bg-black/40 shadow-inner backdrop-blur-md">
              <FeatureIcon icon={feature.icon} className="h-6 w-6 text-[var(--accent-primary)]" strokeWidth={2} />
            </div>
            
            <div className="relative z-10 mt-auto pt-16 xl:pt-24">
               <h3 className="text-[24px] font-semibold tracking-tight text-[var(--text-primary)] leading-[1.2]">{feature.title}</h3>
               <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)] md:max-w-md">{feature.body}</p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

function ComparisonTable(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.h3
        className="text-center text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-[var(--text-primary)]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        NeuroDraft vs. the alternative
      </motion.h3>

      <div className="mt-8 overflow-hidden rounded-[20px] border border-[var(--border)]">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-[var(--surface-sunken)] px-5 py-4 text-[13px] text-[var(--text-muted)]">
          <div className="font-medium"> </div>
          <div className="font-medium text-[var(--accent-primary)]">NeuroDraft</div>
          <div className="font-medium text-[var(--text-soft)]">Traditional neuromarketing lab</div>
        </div>
        {compareRows.map((row, index) => (
          <motion.div
            key={row[0]}
            className={`grid grid-cols-[1.4fr_1fr_1fr] px-5 py-4 text-sm ${
              index % 2 === 0 ? "bg-[var(--page-bg)]" : "bg-[var(--surface-sunken)]"
            }`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
          >
            <div className="text-[14px] text-[var(--text-muted)]">{row[0]}</div>
            <div className="font-medium text-[var(--accent-primary)]">{row[1]}</div>
            <div className="text-[var(--text-soft)]">{row[2]}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function UseCaseCardView({ useCase, index }: Readonly<{ useCase: UseCaseCard; index: number }>): React.JSX.Element {
  return (
    <motion.article
      className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-7 transition-transform duration-200 hover:-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
    >
      <div className="inline-flex rounded-full border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-[var(--accent-primary)]">
        {useCase.badge}
      </div>
      <p className="mt-5 text-lg font-semibold leading-8 text-[var(--text-primary)]">{useCase.pain}</p>
      <p className="mt-4 text-[15px] leading-7 text-[var(--text-secondary)]">{useCase.fix}</p>
      <div className="mt-6 inline-flex rounded-full border border-[var(--border)] bg-black/30 px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-[var(--text-soft)]">
        {useCase.tag}
      </div>
    </motion.article>
  );
}

function DeepDiveSection(): React.JSX.Element {
  return (
    <div className="mt-32 mb-16 space-y-32">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            Identify the exact frame where memory drops.
          </h3>
          <p className="text-[16px] leading-[1.7] text-[var(--text-secondary)]">
            By running your script through the Trimodal Encoder, NeuroDraft builds a simulated physical environment and predicts visual attention. See exactly where your viewer is looking—and when they look away.
          </p>
        </motion.div>
        <motion.div
          className="flex-1 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-sunken)] shadow-2xl">
            <ParallaxImage src="/images/heatmap.png" alt="Brain Heatmap" containerClassName="w-full h-full relative" className="opacity-90 transition-transform duration-700 hover:scale-105" />
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            Actionable metrics in a live dashboard.
          </h3>
          <p className="text-[16px] leading-[1.7] text-[var(--text-secondary)]">
            Compare multi-dimensional readouts of your ad's performance. Does the visual spike match the auditory peak? Is conscious focus sustained through the CTA? Know before you shoot.
          </p>
        </motion.div>
        <motion.div
          className="flex-1 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-sunken)] shadow-2xl">
            <ParallaxImage src="/images/dashboard.png" alt="Neural Dashboard" containerClassName="w-full h-full relative" className="opacity-90 transition-transform duration-700 hover:scale-105" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Features(): React.JSX.Element {
  return (
    <section id="features" className="bg-[var(--page-bg)] py-0">
      <ProblemBar />

      <div className="mx-auto max-w-7xl px-6 py-24 md:px-20">
        <SectionHeading />

        <BentoFeatureGrid />

        <DeepDiveSection />

        <div className="mt-24">
          <ComparisonTable />
        </div>

        <div className="mt-24">
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--accent-primary)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              WHO IT IS FOR
            </motion.p>
            <motion.h3
              className="mt-4 text-[clamp(32px,3.4vw,48px)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.04 }}
            >
              Built for teams who want more signal before the spend.
            </motion.h3>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {useCases.map((useCase, index) => (
              <UseCaseCardView key={useCase.badge} useCase={useCase} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
