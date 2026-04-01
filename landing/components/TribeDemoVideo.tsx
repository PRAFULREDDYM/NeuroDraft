"use client";

import { motion } from "framer-motion";
import { ArrowRight, Database, Layers, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const stages = [
  {
    id: "training",
    icon: Database,
    label: "01 // Training Data",
    title: "1,100 hours of human fMRI data",
    description:
      "Meta TRIBE v2 isn't a proxy. It's a digital twin built from massive fMRI datasets spanning over 700 volunteers, predicting brain activations across 70,000 cortical voxels.",
    image: "/images/graph.png",
  },
  {
    id: "architecture",
    icon: Layers,
    label: "02 // Architecture",
    title: "Trimodal Foundation Models",
    description:
      "The pipeline processes your ad through V-JEPA2 (video), Wav2Vec-BERT (audio), and LLaMA 3.2 (text), mapping them into a unified latent space for the Trimodal Brain Encoder.",
    image: "/images/architecture.png",
  },
  {
    id: "effectiveness",
    icon: CheckCircle2,
    label: "03 // Effectiveness",
    title: "Zero-Shot Generalization",
    description:
      "With 3x the accuracy of prior models, NeuroDraft predicts brain response to novel clips and scripts without needing new subjects. Get lab-grade neuromarketing reads instantly.",
    image: "/images/script.png",
  },
];

export function TribeDemoVideo(): React.JSX.Element {
  return (
    <section id="demo-video" className="bg-[var(--page-bg)] py-24 md:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-20 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--accent-primary)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            BEHIND THE SCENES
          </motion.p>
          <motion.h2
            className="mt-4 text-[clamp(36px,4vw,56px)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.04 }}
          >
            How Meta TRIBE v2 predicts human attention.
          </motion.h2>
        </div>

        <div className="mt-20 space-y-24 md:space-y-32">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`flex flex-col gap-10 md:gap-16 items-center ${
                index % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              {/* Text Content */}
              <motion.div
                className="flex-1 space-y-6"
                initial={{ opacity: 0, x: index % 2 !== 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-medium tracking-[0.15em] text-[var(--text-muted)]">
                  <stage.icon className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                  {stage.label}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                  {stage.title}
                </h3>
                <p className="text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                  {stage.description}
                </p>
                <div className="pt-4">
                  <div className="h-1 w-12 rounded bg-[var(--accent-primary)] opacity-50" />
                </div>
              </motion.div>

              {/* Image/Video Frame */}
              <motion.div
                className="flex-1 w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface-sunken)] shadow-2xl">
                  {/* Subtle edge highlight */}
                  <div className="absolute inset-0 border border-white/5 rounded-[20px] pointer-events-none z-20" />
                  
                  {/* The Image */}
                  <Image
                    src={stage.image}
                    alt={stage.title}
                    fill
                    className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                  />
                  
                  {/* Playhead overlay for "Video" feel */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--text-primary)]/10 flex items-center justify-center backdrop-blur-md">
                      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                    </div>
                    <div className="flex-1 h-1 bg-[var(--text-primary)]/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[var(--accent-primary)]" 
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 4, ease: "linear" }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-primary)]/70">{(index + 1) * 1.5}s</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TribeDemoVideo;
