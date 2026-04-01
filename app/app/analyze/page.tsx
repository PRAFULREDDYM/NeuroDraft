"use client";

import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import Link from "next/link";

import { AgentOrchestrator } from "@/components/pipeline/AgentOrchestrator";
import { InsightPanel } from "@/components/pipeline/InsightPanel";
import { LivePipelineView } from "@/components/pipeline/LivePipelineView";
import { NeuralHeatmap } from "@/components/pipeline/NeuralHeatmap";
import { NeuralTranslator } from "@/components/pipeline/NeuralTranslator";
import { VideoPreview } from "@/components/pipeline/VideoPreview";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import { LANDING_URL } from "@/lib/config";
import { createAnalysisPdfReport, generatePDF, getPdfFileName } from "@/lib/generate-pdf";
import { usePipelineStore } from "@/lib/pipeline-store";

function SectionHeading(props: { description: string; title: string }): JSX.Element {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)]">{props.title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{props.description}</p>
    </div>
  );
}

export default function AnalyzePage(): JSX.Element {
  const agents = usePipelineStore((state) => state.agents);
  const insights = usePipelineStore((state) => state.insights);
  const prediction = usePipelineStore((state) => state.neuralPrediction);
  const runId = usePipelineStore((state) => state.runId);
  const scriptExpansion = usePipelineStore((state) => state.scriptExpansion);
  const video = usePipelineStore((state) => state.videoResult);
  const pipelineStateRef = useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const allAgentsComplete = Object.values(agents).every(
    (agent) => agent.status === "complete" || agent.status === "skipped"
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const canDownloadPdf = Boolean(runId && scriptExpansion && prediction && insights);
  const handleDownloadPdf = async (): Promise<void> => {
    if (!runId || !scriptExpansion) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const report = createAnalysisPdfReport({
        runId,
        title: scriptExpansion.title,
        category: scriptExpansion.brand_category,
        generatedAt: new Date().toISOString(),
        script: scriptExpansion.full_voiceover_script,
        prediction,
        insights
      });
      const filename = getPdfFileName(report.title, prediction?.overall.neural_grade);
      await generatePDF(report, filename);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <main className="min-h-screen neuro-grid">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4">
          <div>
            <a href={LANDING_URL} className="text-sm font-medium transition-opacity hover:opacity-80">
              NeuroDraft
            </a>
            <p className="text-xs text-[var(--text-muted)]">Neural analysis workspace</p>
          </div>
          <div className="text-right text-xs text-[var(--text-muted)]">
            <p>TRIBE v2-calibrated prediction</p>
            <p>Live pipeline + scene previews</p>
          </div>
        </header>

        <div className="mb-6">
          <AnimatedShinyText className="mx-0 max-w-none text-left text-3xl font-medium tracking-tight text-[var(--text-primary)] md:text-4xl">
            Analyze the script
          </AnimatedShinyText>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            Paste a script, watch each step light up in sequence, and inspect the neural readout as soon as the predictor resolves.
          </p>
        </div>

        <div id="pipeline-workspace" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <AgentOrchestrator />
          <LivePipelineView />
        </div>

        <div ref={pipelineStateRef} id="pipeline-state" className="mt-6 flex flex-col gap-6">
          <div className="w-full">
            <SectionHeading
              title="Pipeline state"
              description="Preview the generated scenes and the latest pipeline artifacts as they arrive."
            />
            <VideoPreview result={video} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <SectionHeading
                title="Neural readout"
                description="TRIBE v2-calibrated scores translated into clear creative guidance."
              />
              {prediction ? <NeuralTranslator prediction={prediction} insights={insights} /> : null}
            </div>

            <div>
              <SectionHeading
                title="Neural heatmap"
                description="Scene-by-scene line charts showing where engagement rises, drops, and sticks."
              />
              <NeuralHeatmap prediction={prediction} />
            </div>
          </div>
        </div>

        <section className="mt-8">
          <SectionHeading
            title="Creative direction"
            description="Actionable strategy generated from the neural readout, including rewrite guidance and recall-ranked headlines."
          />
          <InsightPanel engagementArc={prediction?.overall.engagement_arc} result={insights} />
          {allAgentsComplete && runId ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 flex justify-end"
            >
              <Button asChild size="lg" aria-label="View full results">
                <Link href={`/results/${runId}`}>View full results →</Link>
              </Button>
            </motion.div>
          ) : null}
        </section>

        <FloatingActions
          onDownloadPdf={canDownloadPdf ? handleDownloadPdf : undefined}
          isDownloadingPdf={isDownloadingPdf}
          downloadDisabled={!canDownloadPdf || isDownloadingPdf}
        />
      </div>
    </main>
  );
}
