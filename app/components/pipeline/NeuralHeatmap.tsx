"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPercent, scoreColor } from "@/components/pipeline/helpers";
import { getMetricExplanation, getMetricTranslation, scoreToLevel } from "@/lib/neural-translations";
import type { NeuralMetricKey, NeuralPrediction } from "@/lib/types";

const METRICS: Array<{ key: NeuralMetricKey; label: string }> = [
  { key: "visual_cortex_engagement", label: "Visual cortex" },
  { key: "auditory_cortex_engagement", label: "Auditory cortex" },
  { key: "prefrontal_attention", label: "Prefrontal attention" },
  { key: "amygdala_emotional_arousal", label: "Amygdala arousal" },
  { key: "hippocampal_memory_encoding", label: "Memory encoding" },
  { key: "overall_engagement", label: "Overall engagement" }
];

function buildPath(values: number[], width = 720, height = 96): string {
  if (values.length === 0) {
    return "";
  }

  const step = width / Math.max(1, values.length - 1);
  return values
    .map((value, index) => `${index === 0 ? "M" : "L"} ${Math.round(index * step)} ${Math.round(height - value * height)}`)
    .join(" ");
}

export function NeuralHeatmap(props: { prediction: NeuralPrediction | null }): JSX.Element {
  const [selectedScene, setSelectedScene] = useState<number | null>(null);
  const prediction = props.prediction;

  const rows = useMemo(
    () =>
      METRICS.map((metric) => ({
        ...metric,
        values: prediction?.segments.map((segment) => segment.neural_scores[metric.key]) ?? [],
        color: scoreColor(metric.key)
      })),
    [prediction]
  );

  if (!prediction) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-[var(--text-secondary)]">
          Neural heatmap will appear after the predictor finishes.
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Neural heatmap</CardTitle>
            <CardDescription className="mt-2">
              TRIBE v2-calibrated prediction for {prediction.segments.length} scene segments.
            </CardDescription>
          </div>
          <Badge variant="outline">Grade {prediction.overall.neural_grade}</Badge>
        </CardHeader>

        <CardContent className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Timeline</span>
              <span className="tabular">{prediction.segments.at(-1)?.time_end ?? 0}s</span>
            </div>

            <div className="grid gap-3">
              {rows.map((row) => (
                <Card key={row.key} className="border-[var(--border)] bg-[var(--bg-surface)]">
                  <CardContent className="space-y-2 pt-6">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>{row.label}</span>
                      <span className="tabular">{formatPercent(row.values.reduce((sum, value) => sum + value, 0) / Math.max(1, row.values.length))}</span>
                    </div>
                    <div className="relative h-16 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                      <svg viewBox="0 0 720 96" className="absolute inset-0 h-full w-full">
                        <motion.path
                          d={buildPath(row.values)}
                          fill="none"
                          stroke={row.color}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </svg>
                      {row.values.map((value, index) => {
                        const scene = prediction.segments[index];
                        const translation = getMetricTranslation(row.key);
                        const level = scoreToLevel(value);
                        const contextLine = level === "peak" || level === "strong" ? scene?.peak_moment : scene?.drop_moment;
                        return (
                          <Tooltip key={`${row.key}-${index}`}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onMouseEnter={() => setSelectedScene(scene?.scene_id ?? null)}
                                onFocus={() => setSelectedScene(scene?.scene_id ?? null)}
                                onClick={() => setSelectedScene(scene?.scene_id ?? null)}
                                aria-label={`Scene ${scene?.scene_id ?? index + 1} on ${row.label}`}
                                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 p-0 hover:bg-transparent"
                                style={{
                                  left: `${(index / Math.max(1, row.values.length - 1)) * 100}%`,
                                  top: `${Math.round((1 - value) * 100)}%`,
                                  backgroundColor: row.color,
                                  boxShadow:
                                    selectedScene === scene?.scene_id ? `0 0 0 6px color-mix(in srgb, ${row.color} 18%, transparent)` : "none"
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[240px] border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-[var(--text-primary)]">
                              <p className="mb-1 text-xs font-medium text-[var(--accent-primary)]">
                                {translation.plainName} · {Math.round(value * 100)}%
                              </p>
                              <p className="mb-2 text-xs leading-relaxed text-[var(--text-primary)]">
                                {getMetricExplanation(row.key, value)}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {level === "peak" || level === "strong" ? "▲ " : "▼ "}
                                {contextLine ?? "Context unavailable for this point."}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-[var(--bg-surface)]">
              <CardContent className="grid gap-3 pt-6">
                {[
                  ["Neural grade", prediction.overall.neural_grade],
                  ["Mean engagement", formatPercent(prediction.overall.mean_engagement)],
                  ["Memory strength", formatPercent(prediction.overall.memory_strength)],
                  ["Benchmark percentile", `${prediction.overall.benchmark_percentile}th`]
                ].map(([label, value]) => (
                  <Card key={label} className="bg-[var(--bg-elevated)]">
                    <CardContent className="pt-6">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
                      <div
                        className={`mt-2 font-medium text-[var(--text-primary)] tabular ${
                          label === "Neural grade" ? "text-[64px] leading-none font-bold" : "text-lg"
                        }`}
                        style={
                          label === "Neural grade"
                            ? { textShadow: "0 0 40px rgba(0,255,136,0.4)" }
                            : undefined
                        }
                      >
                        {value}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-surface)]">
              <CardContent className="space-y-3 pt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Selected scene</p>
                {selectedScene ? (
                  <>
                    <p className="text-sm text-[var(--text-primary)]">
                      Scene {selectedScene} is highlighted across all metrics.
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Hover or click a point to inspect peak and drop moments in context.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[var(--text-primary)]">No scene selected.</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Interact with any metric point to lock a segment.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
