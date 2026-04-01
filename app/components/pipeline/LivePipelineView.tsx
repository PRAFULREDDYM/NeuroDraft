"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";
import { BadgeCheck, Brain, Film, FileText, Headphones, Sparkles, WandSparkles } from "lucide-react";

import { AgentCard } from "@/components/pipeline/AgentCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { evaluateInsightQuality } from "@/lib/insight-evaluator";
import { usePipelineStore } from "@/lib/pipeline-store";
import type { InsightEvaluationResult, PipelineEvent, PipelineResult } from "@/lib/types";

const AGENT_META = [
  { id: "SCRIPT_EXPANDER", name: "Script expansion", icon: <FileText className="h-4 w-4 text-[var(--accent-primary)]" /> },
  { id: "SCENE_DIRECTOR", name: "Scene planning", icon: <WandSparkles className="h-4 w-4 text-[var(--accent-primary)]" /> },
  { id: "VIDEO_SYNTHESIZER", name: "Scene preview", icon: <Film className="h-4 w-4 text-[var(--accent-primary)]" /> },
  { id: "AUDIO_SYNTHESIZER", name: "Transcript", icon: <Headphones className="h-4 w-4 text-[var(--accent-primary)]" /> },
  { id: "TRIBE_PREDICTOR", name: "Neural prediction", icon: <Brain className="h-4 w-4 text-[var(--accent-primary)]" /> },
  { id: "INSIGHT_WRITER", name: "Creative insights", icon: <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" /> },
  { id: "EVALUATOR", name: "Quality check", icon: <BadgeCheck className="h-4 w-4 text-[var(--accent-primary)]" /> }
] as const;

function loadDemo(runId: string): PipelineResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(`neurodraft-demo-${runId}`);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as PipelineResult;
}

function connectEventSource(
  runId: string,
  onEvent: (event: PipelineEvent) => void
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  try {
    const source = new EventSource(`/api/pipeline/status?runId=${encodeURIComponent(runId)}`);
    source.onmessage = (message) => {
      onEvent(JSON.parse(message.data) as PipelineEvent);
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  } catch {
    return () => undefined;
  }
}

export function LivePipelineView(): JSX.Element {
  const runId = usePipelineStore((state) => state.runId);
  const agents = usePipelineStore((state) => state.agents);
  const updateAgent = usePipelineStore((state) => state.updateAgent);
  const setScriptExpansion = usePipelineStore((state) => state.setScriptExpansion);
  const setAudioResult = usePipelineStore((state) => state.setAudioResult);
  const setVideoResult = usePipelineStore((state) => state.setVideoResult);
  const setNeuralPrediction = usePipelineStore((state) => state.setNeuralPrediction);
  const setInsights = usePipelineStore((state) => state.setInsights);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "demo" | "live">("idle");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!runId) {
      setConnectionState("idle");
      return;
    }

    setConnectionState("connecting");
    const demo = loadDemo(runId);
    if (demo) {
      setConnectionState("demo");
      setScriptExpansion(demo.expanded);
      setAudioResult(demo.audio);
      setVideoResult(demo.video);
      setNeuralPrediction(demo.neural);
      setInsights(demo.insights);
      updateAgent("SCRIPT_EXPANDER", {
        status: "complete",
        progress: 100,
        message: `${demo.expanded.scenes.length} scenes mapped`,
        data: demo.expanded
      });
      updateAgent("SCENE_DIRECTOR", {
        status: "complete",
        progress: 100,
        message: `${demo.directed.length} scenes planned for synthesis.`,
        data: demo.directed
      });
      updateAgent("VIDEO_SYNTHESIZER", {
        status: "complete",
        progress: 100,
        message: demo.video.type === "video" ? "Full video assembled." : "Scene previews ready.",
        data: demo.video
      });
      updateAgent("AUDIO_SYNTHESIZER", {
        status: "complete",
        progress: 100,
        message: demo.audio.message ?? "Voiceover timing loaded.",
        data: demo.audio
      });
      updateAgent("TRIBE_PREDICTOR", {
        status: "complete",
        progress: 100,
        message: `Neural grade: ${demo.neural.overall.neural_grade}.`,
        data: demo.neural
      });
      updateAgent("INSIGHT_WRITER", {
        status: "complete",
        progress: 100,
        message: `${demo.insights.insights.length} creative insights ready.`,
        data: demo.insights
      });
      const evaluation = evaluateInsightQuality({
        insightResult: demo.insights,
        neural: demo.neural,
        expanded: demo.expanded
      });
      updateAgent("EVALUATOR", {
        status: "complete",
        progress: 100,
        message:
          evaluation.status === "pass"
            ? `Quality check passed at ${evaluation.score}/100.`
            : `Quality check completed at ${evaluation.score}/100.`,
        data: evaluation
      });
    }

    const disconnect = connectEventSource(runId, (event) => {
      setConnectionState("live");
      updateAgent(event.agent, {
        status: event.status,
        progress: event.progress,
        message: event.message,
        data: event.data
      });

      if (event.agent === "SCRIPT_EXPANDER" && event.data) {
        setScriptExpansion(event.data as PipelineResult["expanded"]);
      }
      if (event.agent === "AUDIO_SYNTHESIZER" && event.data) {
        setAudioResult(event.data as PipelineResult["audio"]);
      }
      if (event.agent === "VIDEO_SYNTHESIZER" && event.data) {
        setVideoResult(event.data as PipelineResult["video"]);
      }
      if (event.agent === "TRIBE_PREDICTOR" && event.data) {
        setNeuralPrediction(event.data as PipelineResult["neural"]);
      }
      if (event.agent === "INSIGHT_WRITER" && event.data) {
        setInsights(event.data as PipelineResult["insights"]);
      }
      if (event.agent === "EVALUATOR" && event.data) {
        updateAgent("EVALUATOR", {
          status: event.status,
          progress: event.progress,
          message: event.message,
          data: event.data
        });
      }

      setFlash(true);
      window.setTimeout(() => setFlash(false), 250);
    });

    return disconnect;
  }, [runId, setAudioResult, setInsights, setNeuralPrediction, setScriptExpansion, setVideoResult, updateAgent]);

  const orderedAgents = useMemo(
    () =>
      AGENT_META.map((meta) => ({
        ...meta,
        ...agents[meta.id]
      })),
    [agents]
  );

  const activeSummary =
    connectionState === "demo"
      ? "Showing sample results while the live pipeline is unavailable."
      : connectionState === "live"
        ? "Pipeline ready"
        : connectionState === "connecting"
          ? "Connecting to pipeline stream..."
          : "Awaiting a new analysis run.";

  return (
    <Card className="relative h-full overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Live pipeline</CardTitle>
          <CardDescription className="mt-2 max-w-lg">{activeSummary}</CardDescription>
        </div>
        <motion.div
          animate={{ opacity: flash ? 1 : 0.25, scale: flash ? 1.12 : 1 }}
          transition={{ duration: 0.2 }}
          className="h-3 w-3 rounded-full bg-[var(--accent-primary)]"
          aria-label="Pipeline connection activity"
        />
      </CardHeader>

      <CardContent className="space-y-3">
        {orderedAgents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            index={index}
            agent={{
              name: agent.name,
              icon: agent.icon,
              status: agent.status,
              progress: agent.progress,
              message: agent.message,
              preview:
                agent.status === "complete"
                  ? agent.id === "SCRIPT_EXPANDER"
                    ? `${(agent.data as PipelineResult["expanded"] | undefined)?.scenes.length ?? 0} scenes mapped`
                    : agent.id === "TRIBE_PREDICTOR"
                      ? `Neural grade: ${(agent.data as PipelineResult["neural"] | undefined)?.overall.neural_grade ?? "A"}`
                      : agent.id === "VIDEO_SYNTHESIZER"
                        ? "Scene previews ready"
                        : agent.id === "AUDIO_SYNTHESIZER"
                          ? `${(agent.data as PipelineResult["audio"] | undefined)?.transcript.length ?? 0} transcript segments`
                          : agent.id === "INSIGHT_WRITER"
                            ? `${
                                Array.isArray((agent.data as { insights?: unknown[] } | undefined)?.insights)
                                  ? (agent.data as { insights?: unknown[] }).insights?.length ?? 0
                                  : 0
                              } creative insights`
                            : agent.id === "EVALUATOR"
                              ? `Quality score ${Math.round((agent.data as InsightEvaluationResult | undefined)?.score ?? 0)}/100`
                              : "Ready"
                  : undefined,
              data: agent.data
            }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
