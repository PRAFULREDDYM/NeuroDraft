"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, DatabaseZap, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightPanel } from "@/components/pipeline/InsightPanel";
import { NeuralHeatmap } from "@/components/pipeline/NeuralHeatmap";
import { NeuralTranslator } from "@/components/pipeline/NeuralTranslator";
import { SceneSummary } from "@/components/pipeline/SceneSummary";
import { VideoPreview } from "@/components/pipeline/VideoPreview";
import { createDemoAudioResult, createDemoDirectedScenes, createDemoInsights, createDemoNeuralPrediction, createDemoScriptExpansion, createDemoVideoResult } from "@/lib/mock-data";
import { createResultPdfReport, downloadPdf, getPdfFileName } from "@/lib/generate-pdf";
import { usePipelineStore } from "@/lib/pipeline-store";
import type { PipelineResult, ResultsResponse } from "@/lib/types";

async function fetchResult(runId: string): Promise<PipelineResult | null> {
  try {
    const response = await fetch(`/api/results/${encodeURIComponent(runId)}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error("Result request failed");
    }
    const data = (await response.json()) as ResultsResponse & Partial<PipelineResult>;
    return data.result ?? (data.runId ? (data as PipelineResult) : null);
  } catch {
    const raw = sessionStorage.getItem(`neurodraft-demo-${runId}`);
    if (raw) {
      return JSON.parse(raw) as PipelineResult;
    }

    const script = "Happy family. Morning light. Our cereal pours into bowls with real ingredients and a bright smile. VO: Real ingredients, real you.";
    const expanded = createDemoScriptExpansion(script);
    const directed = createDemoDirectedScenes(expanded);
    const audio = createDemoAudioResult(expanded.full_voiceover_script, expanded.duration_seconds);
    const video = createDemoVideoResult(directed);
    const neural = createDemoNeuralPrediction(directed);
    const insights = createDemoInsights(neural, expanded);
    const result: PipelineResult = {
      runId,
      title: expanded.title,
      ad_category: expanded.brand_category,
      expanded,
      directed,
      audio,
      video,
      neural,
      insights,
      completedAt: new Date().toISOString()
    };
    sessionStorage.setItem(`neurodraft-demo-${runId}`, JSON.stringify(result));
    return result;
  }
}

export function ResultsShell(props: { initialResult?: PipelineResult | null; runId: string }): JSX.Element {
  const router = useRouter();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const setRunId = usePipelineStore((state) => state.setRunId);
  const setScriptExpansion = usePipelineStore((state) => state.setScriptExpansion);
  const setAudioResult = usePipelineStore((state) => state.setAudioResult);
  const setVideoResult = usePipelineStore((state) => state.setVideoResult);
  const setNeuralPrediction = usePipelineStore((state) => state.setNeuralPrediction);
  const setInsights = usePipelineStore((state) => state.setInsights);

  const resultQuery = useQuery({
    queryKey: ["neurodraft-result", props.runId],
    queryFn: () => fetchResult(props.runId),
    initialData: props.initialResult ?? undefined
  });

  useEffect(() => {
    setRunId(props.runId);
  }, [props.runId, setRunId]);

  useEffect(() => {
    if (!resultQuery.data) {
      return;
    }

    setScriptExpansion(resultQuery.data.expanded);
    setAudioResult(resultQuery.data.audio);
    setVideoResult(resultQuery.data.video);
    setNeuralPrediction(resultQuery.data.neural);
    setInsights(resultQuery.data.insights);
  }, [resultQuery.data, setAudioResult, setInsights, setNeuralPrediction, setScriptExpansion, setVideoResult]);

  const result = resultQuery.data;
  const campaignTitle = result?.title ?? result?.expanded.title ?? "Ad Script Analysis";
  const campaignCategory = result?.ad_category ?? result?.expanded.brand_category ?? "General";
  const handleAnalyzeAnotherScript = (): void => {
    router.push("/analyze");
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, 100);
  };
  const handleDownloadPdf = async (): Promise<void> => {
    if (!result) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const report = createResultPdfReport(result);
      const filename = getPdfFileName(report.title, result.neural.overall.neural_grade);
      await downloadPdf(report, filename);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (resultQuery.isLoading && !result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-full max-w-3xl" />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-[var(--bg-elevated)]">
                <CardContent className="space-y-3 pt-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <CardHeader>
          <div className="mb-8">
            <span className="text-xs font-medium uppercase tracking-widest text-[var(--accent-primary)]">
              Neural Analysis Complete
            </span>
            <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{campaignTitle}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">{campaignCategory}</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-sm text-[var(--text-secondary)]">{result?.neural?.segments?.length ?? 0} scenes analyzed</span>
              <span className="text-[var(--text-muted)]">·</span>
            <span className="text-sm text-[var(--text-secondary)]">
                Neural grade:{" "}
                <span className="font-medium text-[var(--accent-primary)]">{result?.neural?.overall?.neural_grade ?? "—"}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleAnalyzeAnotherScript}
              aria-label="Analyze another script"
            >
              <ArrowLeft className="h-4 w-4" />
              Analyze another script
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Card className="bg-[var(--bg-surface)]">
            <CardContent className="pt-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Neural grade</p>
              <div
                className="mt-2 text-[64px] font-bold leading-none text-[var(--text-primary)] tabular"
                style={{ textShadow: "0 0 40px rgba(0,255,136,0.4)" }}
              >
                {result?.neural.overall.neural_grade ?? "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--bg-surface)]">
            <CardContent className="pt-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Mean engagement</p>
              <div className="mt-2 text-2xl font-medium text-[var(--text-primary)] tabular">
                {result ? <><NumberTicker value={result.neural.overall.mean_engagement * 100} className="text-[var(--text-primary)]" />%</> : "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--bg-surface)]">
            <CardContent className="pt-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Memory strength</p>
              <div className="mt-2 text-2xl font-medium text-[var(--text-primary)] tabular">
                {result ? <><NumberTicker value={result.neural.overall.memory_strength * 100} className="text-[var(--text-primary)]" />%</> : "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--bg-surface)]">
            <CardContent className="pt-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Benchmark percentile</p>
              <div className="mt-2 text-2xl font-medium text-[var(--text-primary)] tabular">
                {result ? <><NumberTicker value={result.neural.overall.benchmark_percentile} className="text-[var(--text-primary)]" />th</> : "—"}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <NeuralTranslator
          prediction={result?.neural ?? null}
          insights={result?.insights ?? null}
          evaluation={result?.evaluation ?? null}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <VideoPreview result={result?.video ?? null} />
          <NeuralHeatmap prediction={result?.neural ?? null} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <SceneSummary prediction={result?.neural ?? null} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Scene breakdown</CardTitle>
              <CardDescription className="mt-2">Every scene carries a score stack, a recall probability, and a narrative note.</CardDescription>
            </div>
            <Badge variant="outline">{result?.expanded.scenes.length ?? 0} scenes</Badge>
          </CardHeader>

          <CardContent className="space-y-3">
            {result?.neural.segments.map((segment) => (
              <Card key={segment.scene_id} className="bg-[var(--bg-surface)]">
                <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Scene {segment.scene_id}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {segment.time_start}s - {segment.time_end}s
                    </p>
                  </div>
                  <Badge variant="outline">{Math.round(segment.predicted_recall_probability * 100)}% recall</Badge>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                  {Object.entries(segment.neural_scores).map(([key, value]) => (
                    <Card key={key} className="rounded-2xl bg-[var(--bg-elevated)]">
                      <CardContent className="px-3 py-3">
                      <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                        <span className="capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="tabular">{Math.round(value * 100)}%</span>
                      </div>
                      <Progress value={Math.round(value * 100)} className="mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <Card className="rounded-2xl bg-[var(--bg-elevated)]">
                    <CardContent className="pt-4 text-sm text-[var(--text-secondary)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Peak moment</p>
                    <p className="mt-2">{segment.peak_moment}</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl bg-[var(--bg-elevated)]">
                    <CardContent className="pt-4 text-sm text-[var(--text-secondary)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Drop moment</p>
                    <p className="mt-2">{segment.drop_moment}</p>
                    </CardContent>
                  </Card>
                </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <InsightPanel engagementArc={result?.neural.overall.engagement_arc} result={result?.insights ?? null} />
      </motion.div>

      <Card className="border-dashed bg-[var(--bg-surface)]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <FlaskConical className="h-4 w-4 text-[var(--accent-primary)]" />
            <span>{result?.evaluation ? `Quality score ${result.evaluation.score}/100.` : "Results ready for review."}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <DatabaseZap className="h-4 w-4 text-[var(--accent-primary)]" />
            <span>All results stay linked to your analysis workspace.</span>
          </div>
        </CardContent>
      </Card>

      <FloatingActions
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        downloadDisabled={!result || isDownloadingPdf}
      />
    </div>
  );
}
